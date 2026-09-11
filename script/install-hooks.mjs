if (!process.env.CI || process.env.CI === 'false') {
  const { default: husky } = await import('husky')
  process.stdout.write(husky())
}
