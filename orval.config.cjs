module.exports = {
  api: {
    input: {
      target: './swagger.json',
    },
    output: {
      mode: 'split',
      target: 'src/api/generated',
      schemas: 'src/api/generated/models',
      client: 'react-query',
      mock: false,
      prettier: true,
      clean: true,
      override: {
        mutator: {
          path: 'src/api/mutator/custom-instance.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useInfinite: false,
          useInfiniteQueryParam: 'pageParam',
        },
      },
    },
  },
}
