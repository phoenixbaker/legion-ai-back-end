import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import * as request from 'supertest';

describe('Agent Module', () => {
  let app: INestApplication;

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

  it('should create agent with template, and then send a message to the agent', async () => {
    let res = await request(app.getHttpServer()).post('/api/agent').send({
      templateId: '67ddf9f2d00bfe7403bffadf',
      projectId: '67de8c6f98f0ee0db7661c2e',
    });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.templateId).toBe('67ddf9f2d00bfe7403bffadf');
    expect(res.body.projectId).toBe('67de8c6f98f0ee0db7661c2e');

    const agentId = res.body.id;
    console.log(agentId);

    res = await request(app.getHttpServer())
      .post(`/api/agent/${agentId}/chat`)
      .send({
        message: 'Hello, can you use the tool say-hi?',
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Hi, how can I help you today?');
  });
});
