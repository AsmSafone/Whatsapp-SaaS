// archiver v8 is ESM-only (pulled in transitively via @Global StorageModule); stub for ts-jest CJS.
jest.mock('archiver', () => ({ TarArchive: jest.fn() }));

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { applyGlobalValidation } from '../src/config/app-validation';
import { AuthService } from '../src/modules/auth/auth.service';
import { ApiKeyRole } from '../src/modules/auth/entities/api-key.entity';
import { Session } from '../src/modules/session/entities/session.entity';
import { EngineRegistry } from '../src/engine/engine-registry.service';
import type { IWhatsAppEngine } from '../src/engine/interfaces/whatsapp-engine.interface';

/**
 * A group invite code is a transferable join capability, not read data: whoever holds the link
 * joins the group on WhatsApp with no Zaptura credential at all, and that membership survives
 * revoking the key that fetched the code. These tests pin the invite-code GET through the real
 * HTTP stack, mirroring the QR endpoint.
 *
 * The engine is a stub registered in the live EngineRegistry (the message-send e2e harness), so
 * the 401 asserts when unauthenticated or out-of-scope while the 200s prove the pass-through path.
 */
describe('Group invite-code role gate (e2e)', () => {
  let app: INestApplication<App>;
  let sessionId: string;
  let scopedUserKey: string;
  let otherSessionUserKey: string;
  let adminKey: string;
  const groupId = '120363021234567890@g.us';

  const engine = {
    getGroupInviteCode: jest.fn().mockResolvedValue('AbCdEf123456'),
  };

  const inviteCodeGet = (key?: string) => {
    const req = request(app.getHttpServer()).get(`/api/sessions/${sessionId}/groups/${groupId}/invite-code`);
    return key ? req.set('X-API-Key', key) : req;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    applyGlobalValidation(app);
    await app.init();

    const sessionRepo: Repository<Session> = app.get(getRepositoryToken(Session, 'data'));
    sessionId = (await sessionRepo.save(sessionRepo.create({ name: `e2e-invite-${Date.now()}` }))).id;
    const otherSessionId = (await sessionRepo.save(sessionRepo.create({ name: `e2e-invite-other-${Date.now()}` }))).id;

    app.get(EngineRegistry).set(sessionId, engine as unknown as IWhatsAppEngine);

    const authService = app.get(AuthService);
    scopedUserKey = (
      await authService.createApiKey({
        name: 'e2e-invite-user',
        role: ApiKeyRole.USER,
        allowedSessions: [sessionId],
      })
    ).rawKey;
    otherSessionUserKey = (
      await authService.createApiKey({
        name: 'e2e-invite-other-user',
        role: ApiKeyRole.USER,
        allowedSessions: [otherSessionId],
      })
    ).rawKey;
    adminKey = (await authService.createApiKey({ name: 'e2e-invite-admin', role: ApiKeyRole.ADMIN })).rawKey;
  });

  afterAll(async () => {
    try {
      await app?.close();
    } catch {
      /* ignore TypeORM multi-datasource teardown quirk */
    }
  });

  beforeEach(() => jest.clearAllMocks());

  it('refuses an unauthenticated request (401)', async () => {
    await inviteCodeGet().expect(401);
    expect(engine.getGroupInviteCode).not.toHaveBeenCalled();
  });

  it('refuses a user key scoped to a different session (401)', async () => {
    await inviteCodeGet(otherSessionUserKey).expect(401);
    expect(engine.getGroupInviteCode).not.toHaveBeenCalled();
  });

  it('serves a permitted USER key the code + link', async () => {
    const res = await inviteCodeGet(scopedUserKey).expect(200);
    expect(res.body).toEqual({
      inviteCode: 'AbCdEf123456',
      inviteLink: 'https://chat.whatsapp.com/AbCdEf123456',
    });
    expect(engine.getGroupInviteCode).toHaveBeenCalledWith(groupId);
  });

  it('serves an ADMIN key the code + link', async () => {
    await inviteCodeGet(adminKey).expect(200);
  });
});
