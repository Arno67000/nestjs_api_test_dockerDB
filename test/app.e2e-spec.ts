import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import * as pactum from 'pactum';

import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';
import { SignupDto } from '../src/auth/dto';
import { UpdateDto } from '../src/user/dto';
import { PostBookmarkDto } from '../src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let database: DatabaseService;
  const PORT = 9999;
  const API = `http://localhost:${PORT}`;

  const email = 'jean.caisse@gmail.com';

  const agent = () => pactum.spec();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(PORT);

    database = app.get(DatabaseService);
    await database.clearDB();

    pactum.request.setBaseUrl(API);
  });
  afterAll(() => app.close());

  describe('Auth', () => {
    const dto: SignupDto = {
      email,
      password: 'JeanCaisse00',
    };
    describe('Signup', () => {
      it('should fail to signup with empty email and empty password', () => {
        return agent().post('/auth/signup').withBody({}).expectStatus(400);
      });
      it('should fail to signup with empty email', () => {
        return agent()
          .post('/auth/signup')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });
      it('should fail to signup with empty password', () => {
        return agent()
          .post('/auth/signup')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });
      it('should fail to signup with bad email and/or bad password', () => {
        return agent()
          .post('/auth/signup')
          .withBody({ email: 'bad-email', password: 12345 })
          .expectStatus(400);
      });
      it('should signup', () => {
        return agent().post('/auth/signup').withBody(dto).expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('should fail to signin with empty email and empty password', () => {
        return agent().post('/auth/signin').withBody({}).expectStatus(400);
      });
      it('should fail to signin with empty email', () => {
        return agent()
          .post('/auth/signin')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });
      it('should fail to signin with empty password', () => {
        return agent()
          .post('/auth/signin')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });
      it('should fail to signin with bad email and/or bad password', () => {
        return agent()
          .post('/auth/signin')
          .withBody({ email: 'bad-email', password: 12345 })
          .expectStatus(400);
      });
      it('should signin', () => {
        return agent()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('user_token', 'access_token')
          .stores('userId', 'id');
      });
    });
  });

  describe('Users', () => {
    describe('Get current user', () => {
      it('should fail to get current user if no token', () => {
        return agent().get('/user').expectStatus(401);
      });
      it('should get current user', () => {
        return agent()
          .get('/user')
          .withBearerToken('$S{user_token}')
          .expectStatus(200)
          .expectJsonLike({ email });
      });
    });

    describe('Edit current user', () => {
      const updateDto: UpdateDto = { lastName: 'Caisse', firstName: 'Jean' };
      it('should fail to modify user if no token is provided', () => {
        return agent().put('/user').expectStatus(401);
      });
      it('should fail to modify user if email is not an email', () => {
        return agent()
          .put('/user')
          .withBearerToken('$S{user_token}')
          .withBody({ email: 'bad-email' })
          .expectStatus(400);
      });
      it('should fail to modify user if firstName is not a string', () => {
        return agent()
          .put('/user')
          .withBearerToken('$S{user_token}')
          .withBody({ firstName: 47 })
          .expectStatus(400);
      });
      it('should fail to modify user if lastName is not a string', () => {
        return agent()
          .put('/user')
          .withBearerToken('$S{user_token}')
          .withBody({ lastName: 47 })
          .expectStatus(400);
      });
      it('should modify current user if dto is respected', () => {
        return agent()
          .put('/user')
          .withBearerToken('$S{user_token}')
          .withBody(updateDto)
          .expectStatus(200)
          .expectJsonLike(updateDto);
      });
    });
  });

  describe('Bookmarks', () => {
    const createDto: PostBookmarkDto = {
      title: 'bookmark1',
      link: 'linkToBookmark',
      description: 'desc',
    };
    describe('Get empty bookmark array', () => {
      it('should fail to get bookmarks if no token', () => {
        return agent().get('/bookmarks').expectStatus(401);
      });
      it('should get empty bookmarks array', () => {
        return agent()
          .get('/bookmarks')
          .withBearerToken('$S{user_token}')
          .expectStatus(200)
          .expectJson([]);
      });
    });

    describe('Create a bookmark', () => {
      it('should fail to create bookmarks if no token', () => {
        return agent().post('/bookmarks').expectStatus(401);
      });
      it('should fail to create a bookmark if missing title', () => {
        return agent()
          .post('/bookmarks')
          .withBearerToken('$S{user_token}')
          .withBody({ link: createDto.link })
          .expectStatus(400);
      });
      it('should fail to create a bookmark if invalid title', () => {
        return agent()
          .post('/bookmarks')
          .withBearerToken('$S{user_token}')
          .withBody({ link: createDto.link, title: 1234 })
          .expectStatus(400);
      });
      it('should fail to create a bookmark if missing link', () => {
        return agent()
          .post('/bookmarks')
          .withBearerToken('$S{user_token}')
          .withBody({ title: createDto.title })
          .expectStatus(400);
      });
      it('should fail to create a bookmark if invalid link', () => {
        return agent()
          .post('/bookmarks')
          .withBearerToken('$S{user_token}')
          .withBody({ title: createDto.title, link: 1234 })
          .expectStatus(400);
      });
      it('should create a bookmark', () => {
        return agent()
          .post('/bookmarks')
          .withBearerToken('$S{user_token}')
          .withBody(createDto)
          .expectStatus(201)
          .stores('bookmark_id', 'id')
          .expectJsonLike(createDto);
      });
    });

    describe('Get all bookmarks', () => {
      it('should get all bookmarks', () => {
        return agent()
          .get('/bookmarks')
          .withBearerToken('$S{user_token}')
          .expectStatus(200)
          .expectJsonLength(1)
          .expectJsonLike([createDto]);
      });
    });

    describe('Get a bookmark', () => {
      it('should fail to get a bookmark if id is not a number', () => {
        return agent()
          .get('/bookmarks/noId')
          .withBearerToken('$S{user_token}')
          .expectStatus(400);
      });
      it('should get a bookmark by its id', () => {
        return agent()
          .get('/bookmarks/$S{bookmark_id}')
          .withBearerToken('$S{user_token}')
          .expectStatus(200)
          .expectJsonLike(createDto);
      });
      it('should not get a unexisting bookmark', () => {
        return agent()
          .get('/bookmarks/999999')
          .withBearerToken('$S{user_token}')
          .expectStatus(200)
          .expectBody('');
      });
    });

    describe('Update a bookmark', () => {
      const title = 'new title';
      it('should fail to update a bookmark if id is not a number', () => {
        return agent()
          .put('/bookmarks/noId')
          .withBody({ title })
          .withBearerToken('$S{user_token}')
          .expectStatus(400);
      });
      it('should fail to create bookmarks if no token', () => {
        return agent()
          .put('/bookmarks/$S{bookmark_id}')
          .withBody({ title })
          .expectStatus(401);
      });
      it('should fail to create a bookmark if invalid title', () => {
        return agent()
          .put('/bookmarks/$S{bookmark_id}')
          .withBearerToken('$S{user_token}')
          .withBody({ title: 1234 })
          .expectStatus(400);
      });
      it('should fail to create a bookmark if invalid link', () => {
        return agent()
          .put('/bookmarks/$S{bookmark_id}')
          .withBearerToken('$S{user_token}')
          .withBody({ link: 1234 })
          .expectStatus(400);
      });
      it('should update a bookmark by its id', () => {
        return agent()
          .put('/bookmarks/$S{bookmark_id}')
          .withBody({ title })
          .withBearerToken('$S{user_token}')
          .expectStatus(200)
          .expectBodyContains(title);
      });
      it('should not update an inaccessible bookmark', () => {
        return agent()
          .put('/bookmarks/999999')
          .withBody({ title })
          .withBearerToken('$S{user_token}')
          .expectStatus(403);
      });
    });

    describe('Delete a bookmark', () => {
      it('should fail to delete a bookmark if id is not a number', () => {
        return agent()
          .delete('/bookmarks/noId')
          .withBearerToken('$S{user_token}')
          .expectStatus(400);
      });
      it('should fail to delete bookmarks if no token', () => {
        return agent().delete('/bookmarks/$S{bookmark_id}').expectStatus(401);
      });
      it('should delete a bookmark by its id', () => {
        return agent()
          .delete('/bookmarks/$S{bookmark_id}')
          .withBearerToken('$S{user_token}')
          .expectStatus(204);
      });
      it('should not delete an inaccessible bookmark', () => {
        return agent()
          .delete('/bookmarks/$S{bookmark_id}')
          .withBearerToken('$S{user_token}')
          .expectStatus(403);
      });
    });

    describe('Get empty bookmark array again', () => {
      it('should get empty bookmarks array', () => {
        return agent()
          .get('/bookmarks')
          .withBearerToken('$S{user_token}')
          .expectStatus(200)
          .expectJson([]);
      });
    });
  });
});
