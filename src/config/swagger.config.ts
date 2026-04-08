import swaggerJsDoc from 'swagger-jsdoc';

const options: swaggerJsDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart API Hub',
      description: 'A json-server-like API server.',
      version: '0.1.0',
    },
  },
  apis: ['./docs/**/*.yaml'],
};

export default swaggerJsDoc(options);
