// OpenAPI 3 description of the API, served by Swagger UI at /api/docs.
const error = (description: string) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
})

const json = (schema: object) => ({ 'application/json': { schema } })

const idParam = (description: string) => ({
  name: 'id',
  in: 'path',
  required: true,
  description,
  schema: { type: 'integer' },
})

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Bookmarkly API',
    version: '1.0.0',
    description: 'Backend for the Bookmarkly frontend. All responses are JSON.',
  },
  servers: [{ url: '/api' }],
  tags: [{ name: 'Auth' }, { name: 'Categories' }, { name: 'Bookmarks' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { error: { type: 'string' } },
        required: ['error'],
      },
      LoginRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          password: { type: 'string', example: 'password' },
        },
        required: ['email', 'password'],
      },
      LoginResponse: {
        type: 'object',
        properties: { token: { type: 'string', description: 'JWT, valid for 7 days' } },
        required: ['token'],
      },
      AuthProfile: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
        },
        required: ['email', 'name'],
      },
      Profile: {
        type: 'object',
        properties: { name: { type: 'string' } },
        required: ['name'],
      },
      CategoryInput: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Development' },
          alias: { type: 'string', example: 'development' },
        },
        required: ['name', 'alias'],
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          alias: { type: 'string' },
        },
        required: ['id', 'name', 'alias'],
      },
      CategoryListItem: {
        allOf: [
          { $ref: '#/components/schemas/Category' },
          {
            type: 'object',
            properties: {
              bookmarks: {
                type: 'array',
                nullable: true,
                description: 'Always null; load bookmarks via /categories/{id}/bookmarks',
                items: { $ref: '#/components/schemas/Bookmark' },
              },
            },
          },
        ],
      },
      BookmarkInput: {
        type: 'object',
        properties: {
          category_id: { type: 'integer', example: 1 },
          url: { type: 'string', format: 'uri', example: 'https://vuejs.org' },
          title: {
            type: 'string',
            description: 'Optional; scraped from the page when omitted',
            example: 'Vue.js',
          },
          image: {
            type: 'string',
            format: 'uri',
            description: 'Optional image URL; scraped from og:image when omitted',
            example: 'https://vuejs.org/images/logo.png',
          },
        },
        required: ['category_id', 'url'],
      },
      Bookmark: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          category_id: { type: 'integer' },
          url: { type: 'string', format: 'uri' },
          title: { type: 'string', nullable: true },
          image: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'category_id', 'url', 'title', 'image', 'created_at'],
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in and get a JWT',
        operationId: 'login',
        security: [],
        requestBody: {
          required: true,
          content: json({ $ref: '#/components/schemas/LoginRequest' }),
        },
        responses: {
          200: {
            description: 'Logged in',
            content: json({ $ref: '#/components/schemas/LoginResponse' }),
          },
          400: error('Invalid request body'),
          401: error('Invalid email or password'),
        },
      },
    },
    '/auth/profile': {
      get: {
        tags: ['Auth'],
        summary: 'Email and name of the current user',
        operationId: 'getAuthProfile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Current user',
            content: json({ $ref: '#/components/schemas/AuthProfile' }),
          },
          401: error('Missing or invalid token'),
        },
      },
    },
    '/profile': {
      get: {
        tags: ['Auth'],
        summary: 'Display name of the current user',
        operationId: 'getProfile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Current user name',
            content: json({ $ref: '#/components/schemas/Profile' }),
          },
          401: error('Missing or invalid token'),
        },
      },
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List all categories',
        operationId: 'listCategories',
        security: [],
        responses: {
          200: {
            description: 'Categories ordered by id',
            content: json({
              type: 'array',
              items: { $ref: '#/components/schemas/CategoryListItem' },
            }),
          },
        },
      },
      post: {
        tags: ['Categories'],
        summary: 'Create a category',
        operationId: 'createCategory',
        security: [],
        requestBody: {
          required: true,
          content: json({ $ref: '#/components/schemas/CategoryInput' }),
        },
        responses: {
          201: {
            description: 'Created',
            content: json({ $ref: '#/components/schemas/Category' }),
          },
          400: error('Invalid request body'),
        },
      },
    },
    '/categories/{id}': {
      put: {
        tags: ['Categories'],
        summary: 'Update a category',
        operationId: 'updateCategory',
        security: [],
        parameters: [idParam('Category id')],
        requestBody: {
          required: true,
          content: json({ $ref: '#/components/schemas/CategoryInput' }),
        },
        responses: {
          200: {
            description: 'Updated',
            content: json({ $ref: '#/components/schemas/Category' }),
          },
          400: error('Invalid request body'),
          404: error('Category not found'),
        },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Delete a category and its bookmarks',
        operationId: 'deleteCategory',
        security: [],
        parameters: [idParam('Category id')],
        responses: {
          204: { description: 'Deleted' },
          404: error('Category not found'),
        },
      },
    },
    '/categories/{id}/bookmarks': {
      get: {
        tags: ['Bookmarks'],
        summary: 'Bookmarks of one category, newest first',
        operationId: 'listCategoryBookmarks',
        security: [],
        parameters: [idParam('Category id')],
        responses: {
          200: {
            description: 'Bookmarks',
            content: json({ type: 'array', items: { $ref: '#/components/schemas/Bookmark' } }),
          },
        },
      },
    },
    '/bookmarks': {
      post: {
        tags: ['Bookmarks'],
        summary: 'Create a bookmark',
        operationId: 'createBookmark',
        security: [],
        description: 'Title and image are scraped from the URL unless passed in the body.',
        requestBody: {
          required: true,
          content: json({ $ref: '#/components/schemas/BookmarkInput' }),
        },
        responses: {
          201: {
            description: 'Created',
            content: json({ $ref: '#/components/schemas/Bookmark' }),
          },
          400: error('Invalid request body'),
          404: error('Category not found'),
        },
      },
    },
    '/bookmarks/{id}': {
      delete: {
        tags: ['Bookmarks'],
        summary: 'Delete a bookmark',
        operationId: 'deleteBookmark',
        security: [],
        parameters: [idParam('Bookmark id')],
        responses: {
          204: { description: 'Deleted' },
          404: error('Bookmark not found'),
        },
      },
    },
  },
}
