import app from './app';
import { env } from './config/env';

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Mini ERP + CRM Server running on port ${PORT} in ${env.NODE_ENV} mode`);
});
