export const isDevelopment = process.env.NODE_ENV == 'development'
export const isProduction = process.env.NODE_ENV == 'production'

if (!isDevelopment && !isProduction)
    console.error(`INVALID NODE_ENV VALUE: ${process.env.NODE_ENV}`)
