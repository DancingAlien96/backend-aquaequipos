import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import https from 'https';

if (!process.env.WOOCOMMERCE_URL) {
  throw new Error('WOOCOMMERCE_URL is not defined in environment variables');
}

if (!process.env.WOOCOMMERCE_CONSUMER_KEY) {
  throw new Error('WOOCOMMERCE_CONSUMER_KEY is not defined in environment variables');
}

if (!process.env.WOOCOMMERCE_CONSUMER_SECRET) {
  throw new Error('WOOCOMMERCE_CONSUMER_SECRET is not defined in environment variables');
}

const wooCommerce = new WooCommerceRestApi({
  url: process.env.WOOCOMMERCE_URL,
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  version: 'wc/v3',
  queryStringAuth: true,
  axiosConfig: {
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  }
});

export default wooCommerce;
