import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { and, desc, eq, ilike } from 'drizzle-orm';
import type { Database } from '@impact/database';
import { schema } from '@impact/database';
import type { AuthUser } from '../../common/decorators/index';
import { DATABASE_TOKEN } from '../../providers/database.module';
import type { CreatePolicyDto } from './dto/create-policy.dto';
import type { UploadPolicyVersionDto } from './dto/upload-policy-version.dto';

export interface TextChunk {
  chunkIndex: number;
  text: string;
  wordCount: number;
  charCount: number;
}

@Injectable()
export class PoliciesService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  /**
   * Creates a new institutional policy record.
   */
  async createPolicy(dto: CreatePolicyDto, actor: AuthUser) {
    const [policy] = await this.db
      .insert(schema.policies)
      .values({
        institutionId: actor.institutionId,
        name: dto.name.trim(),
        type: dto.type,
        description: dto.description?.trim() ?? null,
        ownerOffice: dto.ownerOffice?.trim() ?? null,
        isActive: true,
      })
      .returning();

    return policy;
  }

  /**
   * Ingests and chunks a new document version for a policy.
   * Performs SHA-256 hashing, chunking, and stores chunks with metadata.
   */
  async createPolicyVersion(
    policyId: string,
    dto: UploadPolicyVersionDto,
    actor: AuthUser,
  ) {
    // 1. Verify policy exists and belongs to tenant
    const policy = await this.db.query.policies.findFirst({
      where: and(
        eq(schema.policies.id, policyId),
        eq(schema.policies.institutionId, actor.institutionId),
      ),
    });

    if (!policy) {
      throw new NotFoundException(`Policy ${policyId} not found`);
    }

    // 2. Compute SHA-256 hash of the document content
    const documentHash = createHash('sha256')
      .update(dto.documentContent, 'utf8')
      .digest('hex');

    // 3. Chunk the document content (512 token approx ~ 2000 chars, 64 token overlap)
    const chunks = this.chunkText(dto.documentContent, 2000, 250);

    // 4. Create policy version record
    const [version] = await this.db
      .insert(schema.policyVersions)
      .values({
        institutionId: actor.institutionId,
        policyId,
        versionLabel: dto.versionLabel.trim(),
        effectiveFrom: dto.effectiveFrom,
        effectiveTo: dto.effectiveTo ?? null,
        documentUrl: dto.fileName ?? `${policy.type}_${dto.versionLabel}.txt`,
        documentHash,
        status: 'active',
        processingLog: [
          {
            timestamp: new Date().toISOString(),
            action: 'INGESTION_AND_CHUNKING',
            totalChunks: chunks.length,
            documentHash,
          },
        ],
        uploadedBy: actor.id,
        approvedBy: actor.id,
        approvedAt: new Date(),
      })
      .returning();

    if (!version) throw new Error('Failed to create policy version record');

    // 5. Insert chunks into policy_chunks table
    if (chunks.length > 0) {
      await this.db.insert(schema.policyChunks).values(
        chunks.map((c) => ({
          institutionId: actor.institutionId,
          policyVersionId: version.id,
          chunkIndex: c.chunkIndex,
          text: c.text,
          chunkMetadata: {
            wordCount: c.wordCount,
            charCount: c.charCount,
            policyName: policy.name,
            versionLabel: version.versionLabel,
          },
        })),
      );
    }

    return {
      version,
      chunksCreated: chunks.length,
      documentHash,
    };
  }

  /**
   * Get a policy with its full version history and chunks count.
   */
  async getPolicy(policyId: string, actor: AuthUser) {
    const policy = await this.db.query.policies.findFirst({
      where: and(
        eq(schema.policies.id, policyId),
        eq(schema.policies.institutionId, actor.institutionId),
      ),
      with: {
        versions: true,
      },
    });

    if (!policy) {
      throw new NotFoundException(`Policy ${policyId} not found`);
    }

    return policy;
  }

  /**
   * List all policies for the institution with optional type filter.
   */
  async listPolicies(actor: AuthUser, type?: string) {
    const whereConditions = [eq(schema.policies.institutionId, actor.institutionId)];
    if (type) {
      whereConditions.push(eq(schema.policies.type, type as any));
    }

    return this.db.query.policies.findMany({
      where: and(...whereConditions),
      with: {
        versions: true,
      },
      orderBy: [desc(schema.policies.createdAt)],
    });
  }

  /**
   * Search chunks in a policy version for keyword / textual evidence citations.
   */
  async searchPolicyChunks(
    policyVersionId: string,
    query: string,
    actor: AuthUser,
  ) {
    const chunks = await this.db.query.policyChunks.findMany({
      where: and(
        eq(schema.policyChunks.policyVersionId, policyVersionId),
        eq(schema.policyChunks.institutionId, actor.institutionId),
        ilike(schema.policyChunks.text, `%${query}%`),
      ),
      limit: 10,
    });

    return chunks;
  }

  // ─── Chunking Utility ───────────────────────────────────────────────────────

  /**
   * Chunks text into overlapping segments preserving sentence boundaries where possible.
   * Pure, reusable function.
   */
  chunkText(text: string, chunkSize = 2000, overlap = 250): TextChunk[] {
    const cleaned = text.trim();
    if (!cleaned) return [];

    if (cleaned.length <= chunkSize) {
      return [
        {
          chunkIndex: 0,
          text: cleaned,
          wordCount: cleaned.split(/\s+/).length,
          charCount: cleaned.length,
        },
      ];
    }

    const chunks: TextChunk[] = [];
    let startIndex = 0;
    let chunkIndex = 0;

    while (startIndex < cleaned.length) {
      let endIndex = startIndex + chunkSize;

      // If we are not at the end of the text, try to find a clean sentence or paragraph boundary
      if (endIndex < cleaned.length) {
        const lastPeriod = cleaned.lastIndexOf('.', endIndex);
        const lastNewline = cleaned.lastIndexOf('\n', endIndex);
        const bestBoundary = Math.max(lastPeriod, lastNewline);

        // Only snap to boundary if it's within a reasonable distance (last 20% of chunk)
        if (bestBoundary > startIndex + chunkSize * 0.8) {
          endIndex = bestBoundary + 1;
        }
      } else {
        endIndex = cleaned.length;
      }

      const chunkText = cleaned.substring(startIndex, endIndex).trim();
      if (chunkText.length > 0) {
        chunks.push({
          chunkIndex,
          text: chunkText,
          wordCount: chunkText.split(/\s+/).length,
          charCount: chunkText.length,
        });
        chunkIndex++;
      }

      if (endIndex >= cleaned.length) break;
      startIndex = Math.max(startIndex + 1, endIndex - overlap);
    }

    return chunks;
  }
}
