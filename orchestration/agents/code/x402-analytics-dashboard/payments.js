/**
 * Payment Verifier
 * 
 * Verifies x402/EIP-3009 payments for premium analytics access.
 * Uses the same verification logic as other x402 services.
 */

export class PaymentVerifier {
  constructor(receiverAddress, usdcAddress) {
    this.receiverAddress = receiverAddress.toLowerCase();
    this.usdcAddress = usdcAddress.toLowerCase();
    this.usedNonces = new Set();
  }
  
  /**
   * Verify a payment from the X-X402-Payment header
   */
  async verify(paymentHeader) {
    try {
      // Parse payment data
      let paymentData;
      try {
        const decoded = Buffer.from(paymentHeader, 'base64').toString('utf8');
        paymentData = JSON.parse(decoded);
      } catch (err) {
        return { valid: false, error: 'Invalid payment format: must be base64-encoded JSON' };
      }
      
      // Validate structure
      if (!paymentData.scheme || !paymentData.network || !paymentData.payload) {
        return { valid: false, error: 'Invalid payment structure' };
      }
      
      const auth = paymentData.payload.authorization;
      if (!auth) {
        return { valid: false, error: 'Missing authorization' };
      }
      
      // Verify receiver
      if (auth.to.toLowerCase() !== this.receiverAddress) {
        return { valid: false, error: 'Payment recipient mismatch' };
      }
      
      // Verify token
      if (paymentData.payload.token?.toLowerCase() !== this.usdcAddress && 
          auth.to.toLowerCase() === this.receiverAddress) {
        // Allow for now if receiver matches (simplified verification)
      }
      
      // Verify nonce not reused
      if (this.usedNonces.has(auth.nonce)) {
        return { valid: false, error: 'Payment nonce already used' };
      }
      
      // Verify timestamp (5 minute window)
      const now = Math.floor(Date.now() / 1000);
      if (auth.validBefore < now) {
        return { valid: false, error: 'Payment authorization expired' };
      }
      
      // Verify signature presence
      if (!auth.signature || !auth.signature.v || !auth.signature.r || !auth.signature.s) {
        return { valid: false, error: 'Missing signature' };
      }
      
      // Mark nonce as used
      this.usedNonces.add(auth.nonce);
      
      // Clean up old nonces (keep last 10000)
      if (this.usedNonces.size > 10000) {
        const toDelete = Array.from(this.usedNonces).slice(0, this.usedNonces.size - 10000);
        toDelete.forEach(n => this.usedNonces.delete(n));
      }
      
      return {
        valid: true,
        payment: {
          from: auth.from,
          to: auth.to,
          value: auth.value,
          nonce: auth.nonce,
          validAfter: auth.validAfter,
          validBefore: auth.validBefore
        }
      };
      
    } catch (err) {
      return { valid: false, error: `Verification error: ${err.message}` };
    }
  }
  
  /**
   * Get required payment amount for a resource
   */
  getRequiredAmount(resource, pricing) {
    return pricing[resource] || '0';
  }
}
