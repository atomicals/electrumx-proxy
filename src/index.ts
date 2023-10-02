import app from './app';

const port = process.env.PORT as any || 5000;
const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://${host}:${port}`);
  /* eslint-enable no-console */
});
