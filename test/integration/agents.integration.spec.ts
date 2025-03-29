import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import * as request from 'supertest';

describe('Agent Module', () => {
  let app: INestApplication;
  let templateId = '67ddf9f2d00bfe7403bffadf';
  let projectId = '67de8c6f98f0ee0db7661c2e';
  let agentId!: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create agent with template', async () => {
    let res = await request(app.getHttpServer()).post('/api/agent').send({
      templateId,
      projectId,
    });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.templateId).toBe(templateId);
    expect(res.body.projectId).toBe(projectId);

    agentId = res.body.id;
  });

  it('should send a message to the agent', async () => {
    const prompt = 'Can you print "Hello, world!"? through running js';
    let res = await request(app.getHttpServer())
      .post(`/api/agent/${agentId}/chat`)
      .send({
        message: prompt,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    res = await request(app.getHttpServer()).get(`/api/agent/${agentId}`);
    expect(res.status).toBe(200);
    expect(res.body.messages.length).toBeGreaterThanOrEqual(3);
    console.log({ messages: res.body.messages });
    expect(res.body.messages[1].content).toBe(prompt);

    expect(res.body.messages.at(-1).content.length).toBeGreaterThan(0);
  }, 20000);

  it('should delete the agent', async () => {
    let res = await request(app.getHttpServer()).delete(
      `/api/agent/${agentId}`,
    );
    expect(res.status).toBe(200);

    res = await request(app.getHttpServer()).get(`/api/agent/${agentId}`);
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({});
  });
});
