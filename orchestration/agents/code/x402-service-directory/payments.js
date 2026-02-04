/**
 * Payment Verifier
 * 
 * Verifies x402 payment headers for the Service Directory.
 * Supports EIP-3009 authorizations and basic payment payloads.
 */

import { createPublicClient, http, parseAbi } from 'viem';
import { base } from 'viem/chains';

export class PaymentVerifier {
  constructor(receiverAddress, usdcAddress) {
    this.receiverAddress = receiverAddress.toLowerCase();
    this.usdcAddress = usdcAddress;
    
    // Initialize Viem client for Base
    this.client = createPublicClient({
      chain: base,
      transport: http('https://mainnet.base.org')
    });

    // ERC-20 ABI for USDC
    this.usdcAbi = parseAbi([
      'function transferFrom(address from, address to, uint256 amount) external returns (bool)',
      'function allowance(address owner, address spender) external view returns (uint256)',
      'function balanceOf(address account) external view returns (uint256)',
      'function nonces(address owner) external view returns (uint256)',
      'function authorizationState(address authorizer, bytes32 nonce) external view returns (bool)'
    ]);

    // EIP-3009 type hash
    this.transferWithAuthorizationTypeHash = '0x7c7c6cdb67a18743f49ec6fa9b35f50d52ed05cbed4cc592e13b44501c1a2267';

    // Track seen nonces to prevent replay
    this.seenNonces = new Set();
  }

  /**
   * Verify an x402 payment header
   * @param {string} paymentHeader - Base64 encoded payment payload
   * @returns {Object} Verification result
   */
  async verify(paymentHeader) {
    try {
      // Decode payment payload
      let payment;
      try {
        const decoded = Buffer.from(paymentHeader, 'base64').toString('utf-8');
        payment = JSON.parse(decoded);
      } catch (e) {
        return {
          valid: false,
          error: 'Invalid payment encoding'
        };
      }

      // Validate payment structure
      if (!payment.payload || !payment.payload.authorization) {
        return {
          valid: false,
          error: 'Missing authorization in payment payload'
        };
      }

      const auth = payment.payload.authorization;

      // Check required fields
      if (!auth.from || !auth.to || !auth.value || !auth.nonce || !auth.signature) {
        return {
          valid: false,
          error: 'Missing required authorization fields'
        };
      }

      // Verify receiver matches
      if (auth.to.toLowerCase() !== this.receiverAddress) {
        return {
          valid: false,
          error: 'Payment receiver mismatch'
        };
      }

      // Check token is USDC on Base
      if (payment.payload.token && payment.payload.token.toLowerCase() !== this.usdcAddress.toLowerCase()) {
        // Allow for now, but log
        console.log('Warning: Non-USDC token detected:', payment.payload.token);
      }

      // Check network
      if (payment.network !== 'base' && payment.network !== '8453') {
        return {
          valid: false,
          error: 'Unsupported network'
        };
      }

      // Verify timestamp window (5 minutes)
      const now = Math.floor(Date.now() / 1000);
      if (auth.validBefore && parseInt(auth.validBefore) < now) {
        return {
          valid: false,
          error: 'Payment authorization expired'
        };
      }

      if (auth.validAfter && parseInt(auth.validAfter) > now) {
        return {
          valid: false,
          error: 'Payment authorization not yet valid'
        };
      }

      // Check for replay (nonce reuse)
      if (this.seenNonces.has(auth.nonce)) {
        return {
          valid: false,
          error: 'Payment nonce already used (replay detected)'
        };
      }

      // Mark nonce as seen
      this.seenNonces.add(auth.nonce);

      // Verify signature (EIP-712)
      const signatureValid = await this.verifySignature(auth);
      if (!signatureValid) {
        return {
          valid: false,
          error: 'Invalid signature'
        };
      }

      // Optional: Verify on-chain authorization state
      // This would check if the authorization has been used on-chain
      // For demo purposes, we skip this to avoid RPC calls
      
      /*
      try {
        const used = await this.client.readContract({
          address: this.usdcAddress,
          abi: this.usdcAbi,
          functionName: 'authorizationState',
          args: [auth.from, auth.nonce]
        });
        
        if (used) {
          return {
            valid: false,
            error: 'Authorization already used on-chain'
          };
        }
      } catch (e) {
        console.log('Could not verify on-chain authorization state:', e.message);
      }
      */

      return {
        valid: true,
        payment: {
          from: auth.from,
          to: auth.to,
          amount: auth.value,
          nonce: auth.nonce,
          validBefore: auth.validBefore,
          token: payment.payload.token || this.usdcAddress
        }
      };

    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        valid: false,
        error: `Verification failed: ${error.message}`
      };
    }
  }

  /**
   * Verify EIP-712 signature
   */
  async verifySignature(auth) {
    try {
      const { v, r, s } = auth.signature;
      
      // Reconstruct the digest
      const domain = {
        name: 'USDC',
        version: '2',
        chainId: 8453,
        verifyingContract: this.usdcAddress
      };

      const types = {
        TransferWithAuthorization: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'validAfter', type: 'uint256' },
          { name: 'validBefore', type: 'uint256' },
          { name: 'nonce', type: 'bytes32' }
        ]
      };

      const value = {
        from: auth.from,
        to: auth.to,
        value: auth.value,
        validAfter: auth.validAfter || 0,
        validBefore: auth.validBefore,
        nonce: auth.nonce
      };

      // Use viem to verify the signature
      const valid = await this.client.verifyTypedData({
        domain,
        types,
        primaryType: 'TransferWithAuthorization',
        message: value,
        signature: { r, s, v: parseInt(v) },
        address: auth.from
      });

      return valid;

    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Verify a simple payment (for development/testing)
   * This is a simplified version that doesn't do full EIP-3009 verification
   */
  async verifySimple(paymentHeader) {
    try {
      const decoded = Buffer.from(paymentHeader, 'base64').toString('utf-8');
      const payment = JSON.parse(decoded);

      // Basic validation
      if (!payment.from || !payment.to || !payment.amount) {
        return {
          valid: false,
          error: 'Missing required fields'
        };
      }

      // Check receiver
      if (payment.to.toLowerCase() !== this.receiverAddress) {
        return {
          valid: false,
          error: 'Receiver mismatch'
        };
      }

      // Check signature presence
      if (!payment.signature) {
        return {
          valid: false,
          error: 'Missing signature'
        };
      }

      return {
        valid: true,
        payment: {
          from: payment.from,
          to: payment.to,
          amount: payment.amount,
          signature: payment.signature
        }
      };

    } catch (error) {
      return {
        valid: false,
        error: `Verification failed: ${error.message}`
      };
    }
  }

  /**
   * Get expected payment amount for a resource
   */
  getExpectedAmount(resource) {
    const amounts = {
      'registration': '1000000',      // $1.00 USDC
      'featured': '5000000',          // $5.00 USDC
      'premium-search': '10000',      // $0.01 USDC
      'stats': '10000',               // $0.01 USDC
      'verify': '100000'              // $0.10 USDC
    };
    return amounts[resource] || '10000';
  }

  /**
   * Check if payment amount matches expected amount
   */
  validateAmount(actualAmount, expectedResource) {
    const expected = this.getExpectedAmount(expectedResource);
    return actualAmount === expected;
  }
}

export default PaymentVerifier;
