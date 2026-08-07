declare module "iyzipay" {
  interface IyzipayOptions {
    apiKey: string;
    secretKey: string;
    uri: string;
  }

  class Iyzipay {
    constructor(options: IyzipayOptions);
    static LOCALE: { TR: string; EN: string };
    static CURRENCY: { TRY: string; USD: string; EUR: string };
    static PAYMENT_GROUP: { SUBSCRIPTION: string; PRODUCT: string };

    checkoutFormInitialize: {
      create: (request: Record<string, unknown>, callback: (err: unknown, result: unknown) => void) => void;
    };
    checkoutForm: {
      retrieve: (request: Record<string, unknown>, callback: (err: unknown, result: unknown) => void) => void;
    };
  }

  export default Iyzipay;
}
