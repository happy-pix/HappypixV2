// ─────────────────────────────────────────────────────────────────
//  GENERATED FILE — do not edit by hand.
//
//  node backend/scripts/generateDocsAtlas.mjs
//
//  157 route handlers (150 mounted, 7 legacy/unmounted)
//  25 Mongoose models, 466 fields
//  Backends: main (142 mounted), website (8)
// ─────────────────────────────────────────────────────────────────

export const ATLAS_ROUTES = [
  {
    "backend": "main",
    "group": "Legacy (unmounted)",
    "method": "POST",
    "path": "/register",
    "own": "/register",
    "mounted": false,
    "file": "authRoutes.js",
    "line": 13,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "Admin Register (Disabled — legacy route deprecated; use seed script or CRM platform users)",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [],
    "statuses": [],
    "errors": [
      {
        "status": 403,
        "message": null,
        "code": null
      }
    ],
    "models": [],
    "tools": []
  },
  {
    "backend": "main",
    "group": "Legacy (unmounted)",
    "method": "POST",
    "path": "/login",
    "own": "/login",
    "mounted": false,
    "file": "authRoutes.js",
    "line": 18,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": "Admin Login",
    "purpose": "Creates a sign-in. Public.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "token",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 403,
        "message": null,
        "code": null
      },
      {
        "status": 403,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "Organization",
      "RoleConfig",
      "User"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Legacy (unmounted)",
    "method": "GET",
    "path": "/me",
    "own": "/me",
    "mounted": false,
    "file": "authRoutes.js",
    "line": 98,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "GET /api/auth/me — verify cookie and return current user (used on page refresh)",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "user",
            "type": "object",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [],
    "tools": []
  },
  {
    "backend": "main",
    "group": "Legacy (unmounted)",
    "method": "PUT",
    "path": "/profile",
    "own": "/profile",
    "mounted": false,
    "file": "authRoutes.js",
    "line": 116,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "─── Update Profile ─────────────────────────────────────────── PUT /api/auth/profile",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "_id",
            "type": "any",
            "note": null
          },
          {
            "field": "name",
            "type": "any",
            "note": null
          },
          {
            "field": "email",
            "type": "any",
            "note": null
          },
          {
            "field": "role",
            "type": "any",
            "note": null
          },
          {
            "field": "organizationId",
            "type": "any",
            "note": null
          },
          {
            "field": "phoneNumber",
            "type": "any",
            "note": null
          },
          {
            "field": "profilePhotoUrl",
            "type": "any",
            "note": null
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 404,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [],
    "tools": []
  },
  {
    "backend": "main",
    "group": "Legacy (unmounted)",
    "method": "POST",
    "path": "/logout",
    "own": "/logout",
    "mounted": false,
    "file": "authRoutes.js",
    "line": 153,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "Admin Logout — clears the HttpOnly cookie",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "message",
            "type": "string",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [],
    "tools": []
  },
  {
    "backend": "main",
    "group": "Legacy (unmounted)",
    "method": "POST",
    "path": "/forgot-password",
    "own": "/forgot-password",
    "mounted": false,
    "file": "authRoutes.js",
    "line": 169,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "─── User Management (Role-based) ───────────────── Removed as per old CRM cleanup ─── Forgot Password (generate reset token) ───────────────── POST /api/auth/forgot-password Returns a reset token — superadmin can share it with the client.",
    "derived": false,
    "request": {
      "body": [
        {
          "field": "toLowerCase",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "message",
            "type": "string",
            "note": null
          },
          {
            "field": "resetToken",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "User"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Legacy (unmounted)",
    "method": "POST",
    "path": "/reset-password",
    "own": "/reset-password",
    "mounted": false,
    "file": "authRoutes.js",
    "line": 199,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "─── Reset Password (validate token + set new password) ────── POST /api/auth/reset-password",
    "derived": false,
    "request": {
      "body": [
        {
          "field": "length",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "message",
            "type": "string",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "User"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Booth",
    "method": "GET",
    "path": "/api/booth/asset-proxy",
    "own": "/asset-proxy",
    "mounted": true,
    "file": "boothRoutes.js",
    "line": 65,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "Public/booth-accessible asset proxy for template backgrounds, overlays, stickers, and logos",
    "derived": false,
    "request": {
      "body": [],
      "query": [
        {
          "field": "key",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "params": []
    },
    "responses": [],
    "statuses": [],
    "errors": [
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 404,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [],
    "tools": [
      {
        "key": "cloudinary",
        "name": "Cloudinary",
        "kind": "media",
        "note": "Image upload, transformation and signed delivery."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Booth",
    "method": "POST",
    "path": "/api/booth/login",
    "own": "/login",
    "mounted": true,
    "file": "boothRoutes.js",
    "line": 335,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": "PAIRING",
    "purpose": "Creates booth a sign-in. Public.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "email",
          "type": "string",
          "required": true,
          "default": null,
          "note": null
        },
        {
          "field": "appVersion",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "deviceName",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "deviceUuid",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "location",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "password",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "platform",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "installation",
            "type": "object",
            "note": null
          },
          {
            "field": "snapshot",
            "type": "any",
            "note": null
          },
          {
            "field": "state",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Email, password and deviceUuid are required.",
        "code": "BAD_PAIRING"
      },
      {
        "message": "Invalid organization credentials.",
        "code": "INVALID_CREDENTIALS"
      },
      {
        "message": "This account is deactivated.",
        "code": "ACCOUNT_DEACTIVATED"
      },
      {
        "message": "Organization not found. Contact support.",
        "code": "ORG_MISSING"
      },
      {
        "message": "This organization has been banned. Contact HappyPix support.",
        "code": null
      },
      {
        "message": "This organization is suspended — booths are locked until it is restored.",
        "code": null
      },
      {
        "message": "This booth has been blocked by an administrator.",
        "code": null
      }
    ],
    "models": [
      "Device",
      "Organization",
      "User"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Booth",
    "method": "GET",
    "path": "/api/booth/bootstrap",
    "own": "/bootstrap",
    "mounted": true,
    "file": "boothRoutes.js",
    "line": 422,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "Reads booth the booth bootstrap payload. Public.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "message",
            "type": "string",
            "note": null
          },
          {
            "field": "snapshot",
            "type": "object",
            "note": null
          },
          {
            "field": "state",
            "type": "any",
            "note": "From stateEnvelope."
          },
          {
            "field": "serverTime",
            "type": "any",
            "note": "From stateEnvelope."
          },
          {
            "field": "extra",
            "type": "any",
            "note": "From stateEnvelope."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Booth",
    "method": "GET",
    "path": "/api/booth/config",
    "own": "/config",
    "mounted": true,
    "file": "boothRoutes.js",
    "line": 440,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "Reads booth config. Public.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [],
    "statuses": [],
    "errors": [],
    "models": [],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Booth",
    "method": "GET",
    "path": "/api/booth/revision",
    "own": "/revision",
    "mounted": true,
    "file": "boothRoutes.js",
    "line": 448,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": true,
    "auth": false,
    "section": null,
    "purpose": "Reads booth revision. Device-authenticated.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "revision",
            "type": "any",
            "note": null
          },
          {
            "field": "serverTime",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Booth",
    "method": "POST",
    "path": "/api/booth/heartbeat",
    "own": "/heartbeat",
    "mounted": true,
    "file": "boothRoutes.js",
    "line": 457,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": "HEARTBEAT (#76–#81)",
    "purpose": "Creates booth a heartbeat. Public.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "appVersion",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "hardware",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "hardwarePatch",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "knownRevision",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "platform",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "changed",
            "type": "boolean",
            "note": null
          },
          {
            "field": "message",
            "type": "string",
            "note": null
          },
          {
            "field": "snapshot",
            "type": "null",
            "note": null
          },
          {
            "field": "state",
            "type": "any",
            "note": "From stateEnvelope."
          },
          {
            "field": "serverTime",
            "type": "any",
            "note": "From stateEnvelope."
          },
          {
            "field": "extra",
            "type": "any",
            "note": "From stateEnvelope."
          },
          {
            "field": "revision",
            "type": "any",
            "note": null
          },
          {
            "field": "hardware",
            "type": "object",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Booth",
    "method": "POST",
    "path": "/api/booth/checkout/quote",
    "own": "/checkout/quote",
    "mounted": true,
    "file": "boothRoutes.js",
    "line": 522,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": true,
    "auth": false,
    "section": "CHECKOUT (#103–#107, #44)",
    "purpose": "Creates checkout quote. Device-authenticated.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "templateId",
          "type": "string",
          "required": true,
          "default": null,
          "note": null
        },
        {
          "field": "couponCode",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "eventId",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "layoutId",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "prints",
          "type": "number",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "quoteId",
            "type": "string",
            "note": null
          },
          {
            "field": "unitPrice",
            "type": "any",
            "note": null
          },
          {
            "field": "prints",
            "type": "any",
            "note": null
          },
          {
            "field": "gross",
            "type": "any",
            "note": null
          },
          {
            "field": "discount",
            "type": "any",
            "note": null
          },
          {
            "field": "finalAmount",
            "type": "any",
            "note": null
          },
          {
            "field": "couponCode",
            "type": "any",
            "note": null
          },
          {
            "field": "couponMessage",
            "type": "any",
            "note": null
          },
          {
            "field": "settlement",
            "type": "any",
            "note": null
          },
          {
            "field": "currency",
            "type": "string",
            "note": null
          },
          {
            "field": "layoutId",
            "type": "any",
            "note": null
          },
          {
            "field": "priceKey",
            "type": "any",
            "note": null
          },
          {
            "field": "templateId",
            "type": "string",
            "note": null
          },
          {
            "field": "eventId",
            "type": "string",
            "note": null
          },
          {
            "field": "deviceId",
            "type": "string",
            "note": null
          },
          {
            "field": "expiresAt",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "No event is assigned to this booth.",
        "code": "NO_EVENT"
      },
      {
        "message": "Event not found.",
        "code": "EVENT_NOT_FOUND"
      },
      {
        "message": "This event is not running right now.",
        "code": "EVENT_NOT_LIVE"
      },
      {
        "message": "This template is no longer available for the event.",
        "code": "TEMPLATE_UNAVAILABLE"
      },
      {
        "message": "Template and layout do not match.",
        "code": "LAYOUT_MISMATCH"
      }
    ],
    "models": [
      "Coupon",
      "Event"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Booth",
    "method": "POST",
    "path": "/api/booth/payments",
    "own": "/payments",
    "mounted": true,
    "file": "boothRoutes.js",
    "line": 605,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": true,
    "auth": false,
    "section": null,
    "purpose": "Creates booth payments. Device-authenticated.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "quote",
          "type": "string",
          "required": true,
          "default": null,
          "note": null
        },
        {
          "field": "couponCode",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "digitalCopy",
          "type": "boolean",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "discount",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "eventId",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "eventName",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "finalAmount",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "prints",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "sessionId",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 201,
        "fields": [
          {
            "field": "paymentId",
            "type": "string",
            "note": null
          },
          {
            "field": "amount",
            "type": "any",
            "note": null
          },
          {
            "field": "amountPaise",
            "type": "any",
            "note": null
          },
          {
            "field": "qrPayload",
            "type": "any",
            "note": null
          },
          {
            "field": "upiId",
            "type": "any",
            "note": null
          },
          {
            "field": "payeeName",
            "type": "any",
            "note": null
          },
          {
            "field": "settlement",
            "type": "any",
            "note": null
          },
          {
            "field": "status",
            "type": "string",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      201
    ],
    "errors": [
      {
        "message": "A complete quote is required.",
        "code": "QUOTE_REQUIRED"
      },
      {
        "message": "Free checkouts must use the free completion endpoint.",
        "code": "FREE_CHECKOUT"
      },
      {
        "message": "Payment gateway is not configured for your organization. Please enter Razorpay or Cashfree credentials in CRM -> Organization Defaults.",
        "code": "GATEWAY_NOT_CONFIGURED"
      }
    ],
    "models": [
      "Event",
      "Payment"
    ],
    "tools": [
      {
        "key": "razorpay",
        "name": "Razorpay",
        "kind": "payments",
        "note": "Order creation and signature verification."
      },
      {
        "key": "cashfree",
        "name": "Cashfree",
        "kind": "payments",
        "note": "Alternative gateway, chosen per event."
      },
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Booth",
    "method": "GET",
    "path": "/api/booth/payments/:id",
    "own": "/payments/:id",
    "mounted": true,
    "file": "boothRoutes.js",
    "line": 781,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": true,
    "auth": false,
    "section": null,
    "purpose": "Reads booth payments. Device-authenticated.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/booth/payments/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "status",
            "type": "string",
            "note": null
          },
          {
            "field": "settlement",
            "type": "any",
            "note": null
          },
          {
            "field": "gateway",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Payment not found.",
        "code": "PAYMENT_NOT_FOUND"
      }
    ],
    "models": [
      "Payment"
    ],
    "tools": [
      {
        "key": "razorpay",
        "name": "Razorpay",
        "kind": "payments",
        "note": "Order creation and signature verification."
      },
      {
        "key": "cashfree",
        "name": "Cashfree",
        "kind": "payments",
        "note": "Alternative gateway, chosen per event."
      },
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Booth",
    "method": "POST",
    "path": "/api/booth/payments/:id/confirm",
    "own": "/payments/:id/confirm",
    "mounted": true,
    "file": "boothRoutes.js",
    "line": 838,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": true,
    "auth": false,
    "section": null,
    "purpose": "Creates payments confirm. Device-authenticated.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "utr",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/booth/payments/:id/confirm."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          },
          {
            "field": "status",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Payment not found.",
        "code": "PAYMENT_NOT_FOUND"
      },
      {
        "message": "This payment was initiated on a different booth device.",
        "code": "DEVICE_MISMATCH"
      }
    ],
    "models": [
      "Payment"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Booth",
    "method": "POST",
    "path": "/api/booth/checkout/free-complete",
    "own": "/checkout/free-complete",
    "mounted": true,
    "file": "boothRoutes.js",
    "line": 877,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": true,
    "auth": false,
    "section": null,
    "purpose": "Creates checkout free complete. Device-authenticated.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "quote",
          "type": "number",
          "required": true,
          "default": null,
          "note": null
        },
        {
          "field": "couponCode",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "digitalCopy",
          "type": "boolean",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "discount",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "eventId",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "finalAmount",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "prints",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "sessionId",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "success",
            "type": "boolean",
            "note": null
          },
          {
            "field": "paymentId",
            "type": "string",
            "note": null
          },
          {
            "field": "amount",
            "type": "any",
            "note": null
          },
          {
            "field": "printCount",
            "type": "number",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "The complete quote object is required to complete a free checkout.",
        "code": "QUOTE_REQUIRED"
      }
    ],
    "models": [
      "Payment"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Booth",
    "method": "POST",
    "path": "/api/booth/sessions/upload-urls",
    "own": "/sessions/upload-urls",
    "mounted": true,
    "file": "boothRoutes.js",
    "line": 910,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": true,
    "auth": false,
    "section": null,
    "purpose": "DIRECT STORAGE UPLOADS (High-Speed Session Storage via Cloudinary)",
    "derived": false,
    "request": {
      "body": [
        {
          "field": "sessionId",
          "type": "string",
          "required": true,
          "default": null,
          "note": "sessionId is required."
        },
        {
          "field": "eventId",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "files",
          "type": "array",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "s3Configured",
            "type": "boolean",
            "note": null
          },
          {
            "field": "storageConfigured",
            "type": "boolean",
            "note": null
          },
          {
            "field": "urls",
            "type": "array",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "sessionId is required.",
        "code": "BAD_SESSION"
      }
    ],
    "models": [
      "Event"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      },
      {
        "key": "cloudinary",
        "name": "Cloudinary",
        "kind": "media",
        "note": "Image upload, transformation and signed delivery."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Booth",
    "method": "POST",
    "path": "/api/booth/sessions/complete",
    "own": "/sessions/complete",
    "mounted": true,
    "file": "boothRoutes.js",
    "line": 1033,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": true,
    "auth": false,
    "section": null,
    "purpose": "Creates sessions complete. Device-authenticated.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "sessionId",
          "type": "string",
          "required": true,
          "default": null,
          "note": "sessionId is required."
        },
        {
          "field": "composite",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "compositeUrl",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "consent",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "digitalCopy",
          "type": "boolean",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "eventId",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "guestConsent",
          "type": "boolean",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "photos",
          "type": "array",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "shareUrl",
            "type": "any",
            "note": null
          },
          {
            "field": "downloadUrl",
            "type": "any",
            "note": null
          },
          {
            "field": "downloadId",
            "type": "any",
            "note": null
          },
          {
            "field": "downloadExpiresAt",
            "type": "any",
            "note": null
          },
          {
            "field": "galleryEnabled",
            "type": "any",
            "note": null
          },
          {
            "field": "requireGuestConsent",
            "type": "any",
            "note": null
          },
          {
            "field": "guestConsent",
            "type": "any",
            "note": null
          },
          {
            "field": "galleryPhotoIds",
            "type": "array",
            "note": null
          },
          {
            "field": "photosStored",
            "type": "number",
            "note": null
          },
          {
            "field": "photosVisibleInGallery",
            "type": "number",
            "note": null
          },
          {
            "field": "photosSkipped",
            "type": "number",
            "note": null
          },
          {
            "field": "idempotent",
            "type": "boolean",
            "note": null
          },
          {
            "field": "concurrentReconciled",
            "type": "boolean",
            "note": null
          },
          {
            "field": "duplicateKeyRecovered",
            "type": "boolean",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "sessionId is required.",
        "code": "BAD_SESSION"
      }
    ],
    "models": [
      "Device",
      "Event",
      "GuestDownload",
      "Photo"
    ],
    "tools": [
      {
        "key": "cloudinary",
        "name": "Cloudinary",
        "kind": "media",
        "note": "Image upload, transformation and signed delivery."
      },
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Booth",
    "method": "POST",
    "path": "/api/booth/sessions/consent",
    "own": "/sessions/consent",
    "mounted": true,
    "file": "boothRoutes.js",
    "line": 1456,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": true,
    "auth": false,
    "section": null,
    "purpose": "Creates sessions consent. Device-authenticated.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "sessionId",
          "type": "string",
          "required": true,
          "default": null,
          "note": "sessionId is required."
        },
        {
          "field": "allow",
          "type": "boolean",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          },
          {
            "field": "updated",
            "type": "any",
            "note": null
          },
          {
            "field": "guestConsent",
            "type": "any",
            "note": null
          },
          {
            "field": "galleryEnabled",
            "type": "any",
            "note": null
          },
          {
            "field": "requireGuestConsent",
            "type": "any",
            "note": null
          },
          {
            "field": "visibleInGallery",
            "type": "any",
            "note": null
          },
          {
            "field": "device",
            "type": "string",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "sessionId is required.",
        "code": "BAD_SESSION"
      }
    ],
    "models": [],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Booth",
    "method": "POST",
    "path": "/api/booth/support",
    "own": "/support",
    "mounted": true,
    "file": "boothRoutes.js",
    "line": 1476,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": true,
    "auth": false,
    "section": null,
    "purpose": "Guest support ticket raised from the booth (kept from the v1 booth contract — the electron and client-app booth apps call POST /api/booth/support).",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 201,
        "fields": [
          {
            "field": "success",
            "type": "boolean",
            "note": null
          },
          {
            "field": "ticketId",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      201
    ],
    "errors": [],
    "models": [],
    "tools": []
  },
  {
    "backend": "main",
    "group": "Coupons",
    "method": "POST",
    "path": "/api/coupons/public/validate",
    "own": "/public/validate",
    "mounted": true,
    "file": "couponRoutes.js",
    "line": 25,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": true,
    "auth": false,
    "section": null,
    "purpose": "POST /api/coupons/public/validate — Validate coupon (org-scoped by device token)",
    "derived": false,
    "request": {
      "body": [
        {
          "field": "amount",
          "type": "any",
          "required": false,
          "default": "0",
          "note": null
        },
        {
          "field": "code",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "eventId",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "gross",
          "type": "number",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "valid",
            "type": "boolean",
            "note": null
          },
          {
            "field": "discount",
            "type": "any",
            "note": null
          },
          {
            "field": "message",
            "type": "any",
            "note": null
          },
          {
            "field": "coupon",
            "type": "object",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "Coupon"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Identity",
    "method": "POST",
    "path": "/api/auth/login",
    "own": "/login",
    "mounted": true,
    "file": "crm/auth.js",
    "line": 208,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": "─── LOGIN & SESSION ────────────────────────────────────────────",
    "purpose": "Creates authentication a sign-in. Public.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "email",
          "type": "string",
          "required": true,
          "default": null,
          "note": null
        },
        {
          "field": "password",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "token",
            "type": "any",
            "note": null
          },
          {
            "field": "…",
            "type": "unknown",
            "note": "Additional keys spread from another object."
          },
          {
            "field": "payload",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 401,
        "message": null,
        "code": null
      },
      {
        "status": 403,
        "message": null,
        "code": null
      },
      {
        "status": 403,
        "message": null,
        "code": null
      },
      {
        "status": 403,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "Organization",
      "User"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Identity",
    "method": "GET",
    "path": "/api/auth/me",
    "own": "/me",
    "mounted": true,
    "file": "crm/auth.js",
    "line": 289,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "Reads authentication. Public.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [],
    "statuses": [],
    "errors": [],
    "models": [],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Identity",
    "method": "POST",
    "path": "/api/auth/logout",
    "own": "/logout",
    "mounted": true,
    "file": "crm/auth.js",
    "line": 294,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "Creates authentication a sign-out. Public.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [],
    "tools": []
  },
  {
    "backend": "main",
    "group": "Identity",
    "method": "PUT",
    "path": "/api/auth/profile",
    "own": "/profile",
    "mounted": true,
    "file": "crm/auth.js",
    "line": 315,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": "─── PROFILE & PASSWORD ─────────────────────────────────────────",
    "purpose": "Replaces authentication the profile. Public.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "user",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From userView."
          },
          {
            "field": "name",
            "type": "any",
            "note": "From userView."
          },
          {
            "field": "email",
            "type": "any",
            "note": "From userView."
          },
          {
            "field": "role",
            "type": "any",
            "note": "From userView."
          },
          {
            "field": "roleLabel",
            "type": "any",
            "note": "From userView."
          },
          {
            "field": "organizationId",
            "type": "string",
            "note": "From userView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From userView."
          },
          {
            "field": "phoneNumber",
            "type": "any",
            "note": "From userView."
          },
          {
            "field": "profilePhotoUrl",
            "type": "any",
            "note": "From userView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From userView."
          },
          {
            "field": "lastLoginAt",
            "type": "any",
            "note": "From userView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [],
    "tools": []
  },
  {
    "backend": "main",
    "group": "Identity",
    "method": "POST",
    "path": "/api/auth/password",
    "own": "/password",
    "mounted": true,
    "file": "crm/auth.js",
    "line": 324,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "Creates authentication the password. Public.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          },
          {
            "field": "token",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      }
    ],
    "models": [],
    "tools": []
  },
  {
    "backend": "main",
    "group": "Identity",
    "method": "POST",
    "path": "/api/auth/forgot-password",
    "own": "/forgot-password",
    "mounted": true,
    "file": "crm/auth.js",
    "line": 343,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": "─── FORGOT PASSWORD / RESET ────────────────────────────────────",
    "purpose": "Creates authentication forgot password. Public.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "email",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          },
          {
            "field": "delivery",
            "type": "string",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 400,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "User"
    ],
    "tools": [
      {
        "key": "sendgrid",
        "name": "SendGrid",
        "kind": "email",
        "note": "Transactional email."
      },
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Identity",
    "method": "POST",
    "path": "/api/auth/reset-password",
    "own": "/reset-password",
    "mounted": true,
    "file": "crm/auth.js",
    "line": 359,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "Creates authentication reset password. Public.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "code",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "email",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "newPassword",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "User"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Identity",
    "method": "POST",
    "path": "/api/auth/email/change-request",
    "own": "/email/change-request",
    "mounted": true,
    "file": "crm/auth.js",
    "line": 399,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "─── EMAIL CHANGE (OTP flow) ────────────────────────────────────",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          },
          {
            "field": "delivery",
            "type": "string",
            "note": null
          },
          {
            "field": "newEmail",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 409,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "User"
    ],
    "tools": [
      {
        "key": "sendgrid",
        "name": "SendGrid",
        "kind": "email",
        "note": "Transactional email."
      },
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Identity",
    "method": "POST",
    "path": "/api/auth/email/change-confirm",
    "own": "/email/change-confirm",
    "mounted": true,
    "file": "crm/auth.js",
    "line": 419,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "Creates email change confirm. Public.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          },
          {
            "field": "user",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From userView."
          },
          {
            "field": "name",
            "type": "any",
            "note": "From userView."
          },
          {
            "field": "email",
            "type": "any",
            "note": "From userView."
          },
          {
            "field": "role",
            "type": "any",
            "note": "From userView."
          },
          {
            "field": "roleLabel",
            "type": "any",
            "note": "From userView."
          },
          {
            "field": "organizationId",
            "type": "string",
            "note": "From userView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From userView."
          },
          {
            "field": "phoneNumber",
            "type": "any",
            "note": "From userView."
          },
          {
            "field": "profilePhotoUrl",
            "type": "any",
            "note": "From userView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From userView."
          },
          {
            "field": "lastLoginAt",
            "type": "any",
            "note": "From userView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 409,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "User"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "GET",
    "path": "/api/org/asset-proxy",
    "own": "/asset-proxy",
    "mounted": true,
    "file": "crm/org.js",
    "line": 81,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "Public asset proxy — serves local disk assets or S3 template/branding assets before auth middleware so browser <img>, SVG <image>, CSS url(), and Booth <Image> elements can load template backgrounds & overlays without 401 errors.",
    "derived": false,
    "request": {
      "body": [],
      "query": [
        {
          "field": "key",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "params": []
    },
    "responses": [],
    "statuses": [],
    "errors": [
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 404,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [],
    "tools": []
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "GET",
    "path": "/api/org/dashboard",
    "own": "/dashboard",
    "mounted": true,
    "file": "crm/org.js",
    "line": 264,
    "permission": "ORG_DASHBOARD_VIEW",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "DASHBOARD (#3 real limits, #56 usage display, #1 read-only notice)",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [],
    "statuses": [],
    "errors": [],
    "models": [
      "SupportTicket"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "GET",
    "path": "/api/org/revenue",
    "own": "/revenue",
    "mounted": true,
    "file": "crm/org.js",
    "line": 403,
    "permission": "ORG_REVENUE_VIEW",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Reads org revenue. Requires org revenue view.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "wallet",
            "type": "any",
            "note": null
          },
          {
            "field": "settlement",
            "type": "any",
            "note": null
          },
          {
            "field": "wallet",
            "type": "any",
            "note": null
          },
          {
            "field": "settlement",
            "type": "array",
            "note": null
          },
          {
            "field": "matrix",
            "type": "any",
            "note": null
          },
          {
            "field": "monthSplit",
            "type": "any",
            "note": null
          },
          {
            "field": "monthWise",
            "type": "array",
            "note": null
          },
          {
            "field": "total",
            "type": "any",
            "note": null
          },
          {
            "field": "thisMonth",
            "type": "array",
            "note": null
          },
          {
            "field": "fy",
            "type": "array",
            "note": null
          },
          {
            "field": "byEvent",
            "type": "any",
            "note": null
          },
          {
            "field": "byDevice",
            "type": "any",
            "note": null
          },
          {
            "field": "byStatus",
            "type": "array",
            "note": null
          },
          {
            "field": "transactions",
            "type": "array",
            "note": null
          },
          {
            "field": "events",
            "type": "array",
            "note": null
          },
          {
            "field": "devices",
            "type": "array",
            "note": null
          },
          {
            "field": "gallery",
            "type": "object",
            "note": null
          },
          {
            "field": "filters",
            "type": "object",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "Payment"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "GET",
    "path": "/api/org/wallet",
    "own": "/wallet",
    "mounted": true,
    "file": "crm/org.js",
    "line": 523,
    "permission": "ORG_REVENUE_VIEW",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Reads org the wallet. Requires org revenue view.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "wallet",
            "type": "any",
            "note": null
          },
          {
            "field": "payout",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "POST",
    "path": "/api/org/wallet/withdraw",
    "own": "/wallet/withdraw",
    "mounted": true,
    "file": "crm/org.js",
    "line": 527,
    "permission": "ORG_REVENUE_VIEW",
    "writableOrg": true,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates the wallet withdraw. Requires org revenue view. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "amount",
          "type": "number",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 201,
        "fields": [
          {
            "field": "withdrawal",
            "type": "object",
            "note": null
          },
          {
            "field": "wallet",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      201
    ],
    "errors": [
      {
        "message": "Add a UPI ID in Organization Defaults before requesting a withdrawal.",
        "code": "UPI_REQUIRED"
      },
      {
        "message": "Withdrawal exceeds the available wallet balance.",
        "code": "INSUFFICIENT_BALANCE"
      }
    ],
    "models": [
      "Withdrawal"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "GET",
    "path": "/api/org/events",
    "own": "/events",
    "mounted": true,
    "file": "crm/org.js",
    "line": 556,
    "permission": "EVENTS_DEVICES_MANAGE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": "EVENTS (#51–#55, #58/#59, #46)",
    "purpose": "Reads org events. Requires events devices manage.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "events",
            "type": "array",
            "note": null
          },
          {
            "field": "plan",
            "type": "any",
            "note": null
          },
          {
            "field": "templates",
            "type": "array",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "Template"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "POST",
    "path": "/api/org/events",
    "own": "/events",
    "mounted": true,
    "file": "crm/org.js",
    "line": 581,
    "permission": "EVENT_CREATE",
    "writableOrg": true,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates org events. Requires event create. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "name",
          "type": "string",
          "required": false,
          "default": "''",
          "note": "BAD_EVENT"
        },
        {
          "field": "startDate",
          "type": "date",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "endDate",
          "type": "date",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "templateIds",
          "type": "array",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "filters",
          "type": "array",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "digitalCopy",
          "type": "boolean",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "gatewayPriority",
          "type": "any",
          "required": false,
          "default": "'razorpay'",
          "note": null
        },
        {
          "field": "razorpayKeyId",
          "type": "string",
          "required": false,
          "default": "''",
          "note": null
        },
        {
          "field": "razorpayKeySecret",
          "type": "string",
          "required": false,
          "default": "''",
          "note": null
        },
        {
          "field": "cashfreeAppId",
          "type": "string",
          "required": false,
          "default": "''",
          "note": null
        },
        {
          "field": "cashfreeSecretKey",
          "type": "string",
          "required": false,
          "default": "''",
          "note": null
        },
        {
          "field": "cashfreeEnv",
          "type": "any",
          "required": false,
          "default": "'production'",
          "note": null
        },
        {
          "field": "qrTimeoutMinutes",
          "type": "number",
          "required": false,
          "default": "5",
          "note": null
        },
        {
          "field": "boothTimeout",
          "type": "number",
          "required": false,
          "default": "60",
          "note": null
        },
        {
          "field": "branding",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "layoutPrices",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "overrideTemplatePrices",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "templatePrices",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "status",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 201,
        "fields": [
          {
            "field": "event",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      201
    ],
    "errors": [],
    "models": [
      "Event"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "GET",
    "path": "/api/org/events/:id",
    "own": "/events/:id",
    "mounted": true,
    "file": "crm/org.js",
    "line": 607,
    "permission": "EVENTS_DEVICES_MANAGE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Reads org events. Requires events devices manage.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/events/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "event",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Event not found.",
        "code": "EVENT_NOT_FOUND"
      }
    ],
    "models": [
      "Event"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "PUT",
    "path": "/api/org/events/:id",
    "own": "/events/:id",
    "mounted": true,
    "file": "crm/org.js",
    "line": 614,
    "permission": "EVENT_EDIT",
    "writableOrg": true,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Replaces org events. Requires event edit. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "deviceIds",
          "type": "array",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/events/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "event",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Event not found.",
        "code": "EVENT_NOT_FOUND"
      },
      {
        "message": "One or more selected devices do not belong to this organization.",
        "code": "BAD_DEVICE_SELECTION"
      }
    ],
    "models": [
      "Device",
      "Event"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "POST",
    "path": "/api/org/events/:id/pause",
    "own": "/events/:id/pause",
    "mounted": true,
    "file": "crm/org.js",
    "line": 645,
    "permission": "EVENT_EDIT",
    "writableOrg": true,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates events pause. Requires event edit. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/events/:id/pause."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          },
          {
            "field": "status",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Event not found.",
        "code": "EVENT_NOT_FOUND"
      }
    ],
    "models": [
      "Event"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "POST",
    "path": "/api/org/events/:id/resume",
    "own": "/events/:id/resume",
    "mounted": true,
    "file": "crm/org.js",
    "line": 655,
    "permission": "EVENT_EDIT",
    "writableOrg": true,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates events resume. Requires event edit. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/events/:id/resume."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          },
          {
            "field": "status",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Event not found.",
        "code": "EVENT_NOT_FOUND"
      }
    ],
    "models": [
      "Event"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "DELETE",
    "path": "/api/org/events/:id",
    "own": "/events/:id",
    "mounted": true,
    "file": "crm/org.js",
    "line": 664,
    "permission": "EVENT_EDIT",
    "writableOrg": true,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Deletes org events. Requires event edit. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/events/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Event not found.",
        "code": "EVENT_NOT_FOUND"
      },
      {
        "message": "Pause the event before deleting it.",
        "code": "EVENT_ACTIVE"
      }
    ],
    "models": [
      "Event"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "GET",
    "path": "/api/org/devices",
    "own": "/devices",
    "mounted": true,
    "file": "crm/org.js",
    "line": 681,
    "permission": "EVENTS_DEVICES_MANAGE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": "DEVICES (#7, #51–#57)",
    "purpose": "Reads org devices. Requires events devices manage.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "devices",
            "type": "array",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From deviceView."
          },
          {
            "field": "deviceName",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "deviceUuid",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "location",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "operatorName",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "operatorPhone",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "online",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "registeredAt",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "lastSeenAt",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "telemetry",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "connections",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "assignedEvent",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "assignedEventId",
            "type": "string",
            "note": "From deviceView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "POST",
    "path": "/api/org/devices",
    "own": "/devices",
    "mounted": true,
    "file": "crm/org.js",
    "line": 701,
    "permission": "EVENTS_DEVICES_MANAGE",
    "writableOrg": true,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates org devices. Requires events devices manage. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "deviceName",
          "type": "string",
          "required": true,
          "default": null,
          "note": "A device name is required."
        },
        {
          "field": "deviceUuid",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "eventId",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "location",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "operatorName",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "operatorPhone",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 201,
        "fields": [
          {
            "field": "device",
            "type": "any",
            "note": null
          },
          {
            "field": "limit",
            "type": "object",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From deviceView."
          },
          {
            "field": "deviceName",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "deviceUuid",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "location",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "operatorName",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "operatorPhone",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "online",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "registeredAt",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "lastSeenAt",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "telemetry",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "connections",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "assignedEvent",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "assignedEventId",
            "type": "string",
            "note": "From deviceView."
          }
        ]
      }
    ],
    "statuses": [
      201
    ],
    "errors": [
      {
        "message": "A device name is required.",
        "code": "BAD_DEVICE"
      },
      {
        "message": "A device with this installation id already exists.",
        "code": "DEVICE_EXISTS"
      },
      {
        "message": "Event not found.",
        "code": "EVENT_NOT_FOUND"
      }
    ],
    "models": [
      "Device",
      "Event"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "PUT",
    "path": "/api/org/devices/:id",
    "own": "/devices/:id",
    "mounted": true,
    "file": "crm/org.js",
    "line": 739,
    "permission": "EVENTS_DEVICES_MANAGE",
    "writableOrg": true,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Replaces org devices. Requires events devices manage. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "deviceName",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "location",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "operatorName",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "operatorPhone",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "status",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/devices/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "device",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From deviceView."
          },
          {
            "field": "deviceName",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "deviceUuid",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "location",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "operatorName",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "operatorPhone",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "online",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "registeredAt",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "lastSeenAt",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "telemetry",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "connections",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "assignedEvent",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "assignedEventId",
            "type": "string",
            "note": "From deviceView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Device not found.",
        "code": "DEVICE_NOT_FOUND"
      },
      {
        "message": "Device name cannot be empty.",
        "code": "BAD_DEVICE"
      },
      {
        "message": "Phone number looks too long.",
        "code": "BAD_OPERATOR_PHONE"
      },
      {
        "message": "Unknown device status.",
        "code": "BAD_DEVICE_STATUS"
      }
    ],
    "models": [
      "Device"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "POST",
    "path": "/api/org/devices/:id/reset-counters",
    "own": "/devices/:id/reset-counters",
    "mounted": true,
    "file": "crm/org.js",
    "line": 771,
    "permission": "EVENTS_DEVICES_MANAGE",
    "writableOrg": true,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates devices reset counters. Requires events devices manage. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/devices/:id/reset-counters."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          },
          {
            "field": "device",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From deviceView."
          },
          {
            "field": "deviceName",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "deviceUuid",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "location",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "operatorName",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "operatorPhone",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "online",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "registeredAt",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "lastSeenAt",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "telemetry",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "connections",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "assignedEvent",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "assignedEventId",
            "type": "string",
            "note": "From deviceView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Device not found.",
        "code": "DEVICE_NOT_FOUND"
      }
    ],
    "models": [
      "Device"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "POST",
    "path": "/api/org/devices/:id/assign",
    "own": "/devices/:id/assign",
    "mounted": true,
    "file": "crm/org.js",
    "line": 790,
    "permission": "EVENTS_DEVICES_MANAGE",
    "writableOrg": true,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates devices assign. Requires events devices manage. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "eventId",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/devices/:id/assign."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          },
          {
            "field": "device",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From deviceView."
          },
          {
            "field": "deviceName",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "deviceUuid",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "location",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "operatorName",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "operatorPhone",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "online",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "registeredAt",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "lastSeenAt",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "telemetry",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "connections",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "assignedEvent",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "assignedEventId",
            "type": "string",
            "note": "From deviceView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Device not found.",
        "code": "DEVICE_NOT_FOUND"
      },
      {
        "message": "Event not found.",
        "code": "EVENT_NOT_FOUND"
      },
      {
        "message": "Cannot assign a finished event to a device.",
        "code": "EVENT_FINISHED"
      }
    ],
    "models": [
      "Device",
      "Event"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "POST",
    "path": "/api/org/devices/:id/unassign",
    "own": "/devices/:id/unassign",
    "mounted": true,
    "file": "crm/org.js",
    "line": 808,
    "permission": "EVENTS_DEVICES_MANAGE",
    "writableOrg": true,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates devices unassign. Requires events devices manage. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/devices/:id/unassign."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          },
          {
            "field": "device",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From deviceView."
          },
          {
            "field": "deviceName",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "deviceUuid",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "location",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "operatorName",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "operatorPhone",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "online",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "registeredAt",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "lastSeenAt",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "telemetry",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "connections",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "assignedEvent",
            "type": "any",
            "note": "From deviceView."
          },
          {
            "field": "assignedEventId",
            "type": "string",
            "note": "From deviceView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Device not found.",
        "code": "DEVICE_NOT_FOUND"
      }
    ],
    "models": [
      "Device",
      "Event"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "DELETE",
    "path": "/api/org/devices/:id",
    "own": "/devices/:id",
    "mounted": true,
    "file": "crm/org.js",
    "line": 832,
    "permission": "EVENTS_DEVICES_MANAGE",
    "writableOrg": true,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Deletes org devices. Requires events devices manage. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/devices/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          },
          {
            "field": "device",
            "type": "any",
            "note": null
          },
          {
            "field": "invalidated",
            "type": "boolean",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Device not found.",
        "code": "DEVICE_NOT_FOUND"
      }
    ],
    "models": [
      "Device"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "GET",
    "path": "/api/org/tickets",
    "own": "/tickets",
    "mounted": true,
    "file": "crm/org.js",
    "line": 877,
    "permission": "TICKETS_RESOLVE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Reads org support tickets. Requires tickets resolve.",
    "derived": true,
    "request": {
      "body": [],
      "query": [
        {
          "field": "priority",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "status",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "tickets",
            "type": "array",
            "note": null
          },
          {
            "field": "counts",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From ticketView."
          },
          {
            "field": "organizationId",
            "type": "string",
            "note": "From ticketView."
          },
          {
            "field": "subject",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "category",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "priority",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "guest",
            "type": "object",
            "note": "From ticketView."
          },
          {
            "field": "event",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "device",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "sessionId",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "paymentReference",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "messages",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "resolution",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "updatedAt",
            "type": "any",
            "note": "From ticketView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "SupportTicket"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "GET",
    "path": "/api/org/tickets/:id",
    "own": "/tickets/:id",
    "mounted": true,
    "file": "crm/org.js",
    "line": 894,
    "permission": "TICKETS_RESOLVE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Reads org support tickets. Requires tickets resolve.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/tickets/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ticket",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From ticketView."
          },
          {
            "field": "organizationId",
            "type": "string",
            "note": "From ticketView."
          },
          {
            "field": "subject",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "category",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "priority",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "guest",
            "type": "object",
            "note": "From ticketView."
          },
          {
            "field": "event",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "device",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "sessionId",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "paymentReference",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "messages",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "resolution",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "updatedAt",
            "type": "any",
            "note": "From ticketView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Ticket not found.",
        "code": "TICKET_NOT_FOUND"
      }
    ],
    "models": [
      "SupportTicket"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "POST",
    "path": "/api/org/tickets/:id/reply",
    "own": "/tickets/:id/reply",
    "mounted": true,
    "file": "crm/org.js",
    "line": 901,
    "permission": "TICKETS_RESOLVE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates support tickets reply. Requires tickets resolve.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "message",
          "type": "string",
          "required": true,
          "default": null,
          "note": "Message cannot be empty."
        },
        {
          "field": "text",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/tickets/:id/reply."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ticket",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From ticketView."
          },
          {
            "field": "organizationId",
            "type": "string",
            "note": "From ticketView."
          },
          {
            "field": "subject",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "category",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "priority",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "guest",
            "type": "object",
            "note": "From ticketView."
          },
          {
            "field": "event",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "device",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "sessionId",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "paymentReference",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "messages",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "resolution",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "updatedAt",
            "type": "any",
            "note": "From ticketView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Message cannot be empty.",
        "code": "EMPTY_MESSAGE"
      },
      {
        "message": "Ticket not found.",
        "code": "TICKET_NOT_FOUND"
      }
    ],
    "models": [
      "SupportTicket"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "POST",
    "path": "/api/org/tickets/:id/resolve",
    "own": "/tickets/:id/resolve",
    "mounted": true,
    "file": "crm/org.js",
    "line": 913,
    "permission": "TICKETS_RESOLVE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates support tickets resolve. Requires tickets resolve.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "note",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "resolution",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/tickets/:id/resolve."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ticket",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From ticketView."
          },
          {
            "field": "organizationId",
            "type": "string",
            "note": "From ticketView."
          },
          {
            "field": "subject",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "category",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "priority",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "guest",
            "type": "object",
            "note": "From ticketView."
          },
          {
            "field": "event",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "device",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "sessionId",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "paymentReference",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "messages",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "resolution",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "updatedAt",
            "type": "any",
            "note": "From ticketView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Ticket not found.",
        "code": "TICKET_NOT_FOUND"
      }
    ],
    "models": [
      "SupportTicket"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "POST",
    "path": "/api/org/tickets/:id/reopen",
    "own": "/tickets/:id/reopen",
    "mounted": true,
    "file": "crm/org.js",
    "line": 925,
    "permission": "TICKETS_RESOLVE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates support tickets reopen. Requires tickets resolve.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/tickets/:id/reopen."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ticket",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From ticketView."
          },
          {
            "field": "organizationId",
            "type": "string",
            "note": "From ticketView."
          },
          {
            "field": "subject",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "category",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "priority",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "guest",
            "type": "object",
            "note": "From ticketView."
          },
          {
            "field": "event",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "device",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "sessionId",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "paymentReference",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "messages",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "resolution",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From ticketView."
          },
          {
            "field": "updatedAt",
            "type": "any",
            "note": "From ticketView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Ticket not found.",
        "code": "TICKET_NOT_FOUND"
      },
      {
        "message": "Only a resolved ticket can be reopened.",
        "code": "TICKET_NOT_RESOLVED"
      }
    ],
    "models": [
      "SupportTicket"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "GET",
    "path": "/api/org/platform-support",
    "own": "/platform-support",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1004,
    "permission": "ORG_PLATFORM_SUPPORT",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Reads org platform support. Requires org platform support.",
    "derived": true,
    "request": {
      "body": [],
      "query": [
        {
          "field": "status",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "requests",
            "type": "array",
            "note": null
          },
          {
            "field": "counts",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From platformSupportView."
          },
          {
            "field": "ticketNo",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "organizationId",
            "type": "string",
            "note": "From platformSupportView."
          },
          {
            "field": "organization",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "subject",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "category",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "priority",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "creator",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "messages",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "decision",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "lastReapplication",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "reapplyCount",
            "type": "number",
            "note": "From platformSupportView."
          },
          {
            "field": "resolution",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "updatedAt",
            "type": "any",
            "note": "From platformSupportView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "PlatformSupportRequest",
      "User"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "POST",
    "path": "/api/org/platform-support",
    "own": "/platform-support",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1026,
    "permission": "ORG_PLATFORM_SUPPORT",
    "writableOrg": true,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates org platform support. Requires org platform support. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "subject",
          "type": "string",
          "required": true,
          "default": null,
          "note": "A subject is required."
        },
        {
          "field": "category",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "images",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "message",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "priority",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "text",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 201,
        "fields": [
          {
            "field": "request",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From platformSupportView."
          },
          {
            "field": "ticketNo",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "organizationId",
            "type": "string",
            "note": "From platformSupportView."
          },
          {
            "field": "organization",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "subject",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "category",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "priority",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "creator",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "messages",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "decision",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "lastReapplication",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "reapplyCount",
            "type": "number",
            "note": "From platformSupportView."
          },
          {
            "field": "resolution",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "updatedAt",
            "type": "any",
            "note": "From platformSupportView."
          }
        ]
      }
    ],
    "statuses": [
      201
    ],
    "errors": [
      {
        "message": "A subject is required.",
        "code": "SUBJECT_REQUIRED"
      }
    ],
    "models": [
      "PlatformSupportRequest",
      "User"
    ],
    "tools": []
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "GET",
    "path": "/api/org/platform-support/:id",
    "own": "/platform-support/:id",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1058,
    "permission": "ORG_PLATFORM_SUPPORT",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Reads org platform support. Requires org platform support.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/platform-support/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "request",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From platformSupportView."
          },
          {
            "field": "ticketNo",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "organizationId",
            "type": "string",
            "note": "From platformSupportView."
          },
          {
            "field": "organization",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "subject",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "category",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "priority",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "creator",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "messages",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "decision",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "lastReapplication",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "reapplyCount",
            "type": "number",
            "note": "From platformSupportView."
          },
          {
            "field": "resolution",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "updatedAt",
            "type": "any",
            "note": "From platformSupportView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Support request not found.",
        "code": "SUPPORT_REQUEST_NOT_FOUND"
      }
    ],
    "models": [
      "PlatformSupportRequest",
      "User"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "POST",
    "path": "/api/org/platform-support/:id/reply",
    "own": "/platform-support/:id/reply",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1065,
    "permission": "ORG_PLATFORM_SUPPORT",
    "writableOrg": true,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates platform support reply. Requires org platform support. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "text",
          "type": "any",
          "required": true,
          "default": null,
          "note": null
        },
        {
          "field": "images",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "message",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/platform-support/:id/reply."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "request",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From platformSupportView."
          },
          {
            "field": "ticketNo",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "organizationId",
            "type": "string",
            "note": "From platformSupportView."
          },
          {
            "field": "organization",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "subject",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "category",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "priority",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "creator",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "messages",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "decision",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "lastReapplication",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "reapplyCount",
            "type": "number",
            "note": "From platformSupportView."
          },
          {
            "field": "resolution",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "updatedAt",
            "type": "any",
            "note": "From platformSupportView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Support request not found.",
        "code": "SUPPORT_REQUEST_NOT_FOUND"
      },
      {
        "message": "Messages can only be sent on an accepted, active ticket.",
        "code": "TICKET_NOT_OPEN"
      },
      {
        "message": "A message or image attachment is required.",
        "code": "EMPTY_MESSAGE"
      }
    ],
    "models": [
      "PlatformSupportRequest",
      "User"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "POST",
    "path": "/api/org/platform-support/:id/reapply",
    "own": "/platform-support/:id/reapply",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1089,
    "permission": "ORG_PLATFORM_SUPPORT",
    "writableOrg": true,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates platform support reapply. Requires org platform support. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "text",
          "type": "any",
          "required": true,
          "default": null,
          "note": null
        },
        {
          "field": "images",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "message",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/platform-support/:id/reapply."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "request",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From platformSupportView."
          },
          {
            "field": "ticketNo",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "organizationId",
            "type": "string",
            "note": "From platformSupportView."
          },
          {
            "field": "organization",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "subject",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "category",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "priority",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "creator",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "messages",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "decision",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "lastReapplication",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "reapplyCount",
            "type": "number",
            "note": "From platformSupportView."
          },
          {
            "field": "resolution",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From platformSupportView."
          },
          {
            "field": "updatedAt",
            "type": "any",
            "note": "From platformSupportView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Support request not found.",
        "code": "SUPPORT_REQUEST_NOT_FOUND"
      },
      {
        "message": "Only a denied request can be re-applied.",
        "code": "TICKET_NOT_DENIED"
      },
      {
        "message": "Explain what changed since the last decision.",
        "code": "EMPTY_MESSAGE"
      }
    ],
    "models": [
      "PlatformSupportRequest",
      "User"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "GET",
    "path": "/api/org/defaults",
    "own": "/defaults",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1165,
    "permission": "DEFAULTS_VIEW",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Reads org defaults. Requires defaults view.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [],
    "statuses": [],
    "errors": [],
    "models": [
      "Setting"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "PUT",
    "path": "/api/org/defaults",
    "own": "/defaults",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1179,
    "permission": "DEFAULTS_EDIT",
    "writableOrg": true,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Replaces org defaults. Requires defaults edit. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "boothTimeoutSec",
          "type": "number",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "cashfreeAppId",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "cashfreeEnv",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "cashfreeSecretKey",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "gatewayPriority",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "layoutPriceOverrides",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "layoutPrices",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "logoUrl",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "maximumPrints",
          "type": "number",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "name",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "paymentDisplayName",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "payoutMode",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "printOptions",
          "type": "array",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "razorpayEnv",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "razorpayKeyId",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "razorpayKeySecret",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "tagline",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "templatePrices",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "upiId",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [],
    "statuses": [],
    "errors": [
      {
        "message": "Custom Payment Gateways (Razorpay / Cashfree) are exclusively available on Business (Premium) and Enterprise plans. Please upgrade your plan to connect your own gateways.",
        "code": "PREMIUM_PLAN_REQUIRED"
      },
      {
        "message": "Booth timeout must be between 10 and 86400 seconds.",
        "code": "BAD_TIMEOUT"
      },
      {
        "message": "Enter a valid UPI ID, e.g. business@okaxis.",
        "code": "BAD_UPI"
      },
      {
        "message": "Payout mode must be upi or wallet.",
        "code": "BAD_PAYOUT_MODE"
      },
      {
        "message": "Add a UPI ID before switching payouts to UPI.",
        "code": "UPI_REQUIRED"
      },
      {
        "message": "Maximum prints must be between 1 and 50.",
        "code": "BAD_PRINT_LIMIT"
      }
    ],
    "models": [
      "Setting"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "GET",
    "path": "/api/org/coupons",
    "own": "/coupons",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1319,
    "permission": "COUPONS_MANAGE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": "COUPONS (#41–#44)",
    "purpose": "Reads org coupons. Requires coupons manage.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "coupons",
            "type": "array",
            "note": null
          },
          {
            "field": "events",
            "type": "array",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "Coupon"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "POST",
    "path": "/api/org/coupons",
    "own": "/coupons",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1331,
    "permission": "COUPONS_MANAGE",
    "writableOrg": true,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates org coupons. Requires coupons manage. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "type",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "discountType",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "value",
          "type": "number",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "discountValue",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "quantity",
          "type": "number",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "maxUses",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "usedCount",
          "type": "number",
          "required": false,
          "default": "0",
          "note": null
        },
        {
          "field": "usageCount",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "eventIds",
          "type": "array",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "assignedEventIds",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "code",
          "type": "string",
          "required": false,
          "default": "''",
          "note": null
        },
        {
          "field": "expiryDate",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "expiresAt",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "status",
          "type": "any",
          "required": false,
          "default": "'active'",
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 201,
        "fields": [
          {
            "field": "coupon",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      201
    ],
    "errors": [
      {
        "message": "A coupon with this code already exists.",
        "code": "COUPON_EXISTS"
      },
      {
        "message": "One or more selected events do not belong to this organization.",
        "code": "BAD_COUPON_EVENTS"
      }
    ],
    "models": [
      "Coupon",
      "Event"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "PUT",
    "path": "/api/org/coupons/:id",
    "own": "/coupons/:id",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1347,
    "permission": "COUPONS_MANAGE",
    "writableOrg": true,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Replaces org coupons. Requires coupons manage. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "type",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "discountType",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "value",
          "type": "number",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "discountValue",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "quantity",
          "type": "number",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "maxUses",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "usedCount",
          "type": "number",
          "required": false,
          "default": "0",
          "note": null
        },
        {
          "field": "usageCount",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "eventIds",
          "type": "array",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "assignedEventIds",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "code",
          "type": "string",
          "required": false,
          "default": "''",
          "note": null
        },
        {
          "field": "expiryDate",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "expiresAt",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "status",
          "type": "any",
          "required": false,
          "default": "'active'",
          "note": null
        }
      ],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/coupons/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "coupon",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Coupon not found.",
        "code": "COUPON_NOT_FOUND"
      },
      {
        "message": "A coupon with this code already exists.",
        "code": "COUPON_EXISTS"
      }
    ],
    "models": [
      "Coupon"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "POST",
    "path": "/api/org/coupons/:id/pause",
    "own": "/coupons/:id/pause",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1363,
    "permission": "COUPONS_MANAGE",
    "writableOrg": true,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates coupons pause. Requires coupons manage. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/coupons/:id/pause."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          },
          {
            "field": "coupon",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Coupon not found.",
        "code": "COUPON_NOT_FOUND"
      }
    ],
    "models": [
      "Coupon"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "POST",
    "path": "/api/org/coupons/:id/activate",
    "own": "/coupons/:id/activate",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1372,
    "permission": "COUPONS_MANAGE",
    "writableOrg": true,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates coupons activate. Requires coupons manage. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/coupons/:id/activate."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          },
          {
            "field": "coupon",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Coupon not found.",
        "code": "COUPON_NOT_FOUND"
      }
    ],
    "models": [
      "Coupon"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "DELETE",
    "path": "/api/org/coupons/:id",
    "own": "/coupons/:id",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1381,
    "permission": "COUPONS_MANAGE",
    "writableOrg": true,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Deletes org coupons. Requires coupons manage. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/coupons/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Coupon not found.",
        "code": "COUPON_NOT_FOUND"
      }
    ],
    "models": [
      "Coupon"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "POST",
    "path": "/api/org/coupons/validate",
    "own": "/coupons/validate",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1390,
    "permission": "EVENTS_DEVICES_MANAGE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates coupons validate. Requires events devices manage.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "code",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "eventId",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "gross",
          "type": "number",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [],
    "statuses": [],
    "errors": [],
    "models": [],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "GET",
    "path": "/api/org/team",
    "own": "/team",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1421,
    "permission": "ORG_TEAM_VIEW",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Reads org team members. Requires org team view.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "members",
            "type": "any",
            "note": null
          },
          {
            "field": "team",
            "type": "any",
            "note": null
          },
          {
            "field": "canManage",
            "type": "boolean",
            "note": null
          },
          {
            "field": "readOnly",
            "type": "boolean",
            "note": null
          },
          {
            "field": "activeAdmins",
            "type": "number",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "User"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "POST",
    "path": "/api/org/team",
    "own": "/team",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1437,
    "permission": "ORG_TEAM_MANAGE",
    "writableOrg": true,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates org team members. Requires org team manage. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "name",
          "type": "string",
          "required": true,
          "default": null,
          "note": null
        },
        {
          "field": "email",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "password",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "role",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 201,
        "fields": [
          {
            "field": "member",
            "type": "any",
            "note": null
          },
          {
            "field": "user",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From memberView."
          },
          {
            "field": "name",
            "type": "any",
            "note": "From memberView."
          },
          {
            "field": "email",
            "type": "any",
            "note": "From memberView."
          },
          {
            "field": "role",
            "type": "any",
            "note": "From memberView."
          },
          {
            "field": "roleLabel",
            "type": "any",
            "note": "From memberView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From memberView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From memberView."
          }
        ]
      }
    ],
    "statuses": [
      201
    ],
    "errors": [
      {
        "message": "Name, email and password are required.",
        "code": "BAD_MEMBER"
      },
      {
        "message": "Enter a valid email address.",
        "code": "BAD_EMAIL"
      },
      {
        "message": "Password must be at least 8 characters and contain a letter and a number.",
        "code": "WEAK_PASSWORD"
      },
      {
        "message": "A user with this email already exists.",
        "code": "EMAIL_TAKEN"
      }
    ],
    "models": [
      "User"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "PUT",
    "path": "/api/org/team/:id",
    "own": "/team/:id",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1461,
    "permission": "ORG_TEAM_MANAGE",
    "writableOrg": true,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Replaces org team members. Requires org team manage. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "status",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/team/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "member",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From memberView."
          },
          {
            "field": "name",
            "type": "any",
            "note": "From memberView."
          },
          {
            "field": "email",
            "type": "any",
            "note": "From memberView."
          },
          {
            "field": "role",
            "type": "any",
            "note": "From memberView."
          },
          {
            "field": "roleLabel",
            "type": "any",
            "note": "From memberView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From memberView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From memberView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Team member not found.",
        "code": "MEMBER_NOT_FOUND"
      },
      {
        "message": "Organization Admins cannot edit a team member’s name, email or role — only activation status.",
        "code": "IDENTITY_IMMUTABLE"
      },
      {
        "message": "Status must be active or inactive.",
        "code": "BAD_STATUS"
      },
      {
        "message": "This is the last active Organization Admin — promote another admin first.",
        "code": "LAST_ADMIN"
      },
      {
        "message": "You cannot deactivate your own account.",
        "code": "SELF_DEACTIVATE"
      }
    ],
    "models": [
      "User"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "POST",
    "path": "/api/org/team/:id/deactivate",
    "own": "/team/:id/deactivate",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1483,
    "permission": "ORG_TEAM_MANAGE",
    "writableOrg": true,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates team members deactivate. Requires org team manage. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/team/:id/deactivate."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          },
          {
            "field": "member",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From memberView."
          },
          {
            "field": "name",
            "type": "any",
            "note": "From memberView."
          },
          {
            "field": "email",
            "type": "any",
            "note": "From memberView."
          },
          {
            "field": "role",
            "type": "any",
            "note": "From memberView."
          },
          {
            "field": "roleLabel",
            "type": "any",
            "note": "From memberView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From memberView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From memberView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Team member not found.",
        "code": "MEMBER_NOT_FOUND"
      },
      {
        "message": "You cannot deactivate your own account.",
        "code": "SELF_DEACTIVATE"
      },
      {
        "message": "This is the last active Organization Admin — promote another admin first.",
        "code": "LAST_ADMIN"
      }
    ],
    "models": [
      "User"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "POST",
    "path": "/api/org/team/:id/activate",
    "own": "/team/:id/activate",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1497,
    "permission": "ORG_TEAM_MANAGE",
    "writableOrg": true,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates team members activate. Requires org team manage. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/team/:id/activate."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          },
          {
            "field": "member",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From memberView."
          },
          {
            "field": "name",
            "type": "any",
            "note": "From memberView."
          },
          {
            "field": "email",
            "type": "any",
            "note": "From memberView."
          },
          {
            "field": "role",
            "type": "any",
            "note": "From memberView."
          },
          {
            "field": "roleLabel",
            "type": "any",
            "note": "From memberView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From memberView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From memberView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Team member not found.",
        "code": "MEMBER_NOT_FOUND"
      }
    ],
    "models": [
      "User"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "GET",
    "path": "/api/org/gallery",
    "own": "/gallery",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1510,
    "permission": "ORG_GALLERY_VIEW",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": "GALLERY (#18, #60, #61)",
    "purpose": "Reads org the gallery. Requires org gallery view.",
    "derived": true,
    "request": {
      "body": [],
      "query": [
        {
          "field": "boothId",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "eventId",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "enabled",
            "type": "boolean",
            "note": null
          },
          {
            "field": "requireGuestConsent",
            "type": "any",
            "note": null
          },
          {
            "field": "photos",
            "type": "array",
            "note": null
          },
          {
            "field": "events",
            "type": "any",
            "note": null
          },
          {
            "field": "booths",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "Photo"
    ],
    "tools": [
      {
        "key": "cloudinary",
        "name": "Cloudinary",
        "kind": "media",
        "note": "Image upload, transformation and signed delivery."
      },
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "GET",
    "path": "/api/org/gallery/photo/:id/view",
    "own": "/gallery/photo/:id/view",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1618,
    "permission": "ORG_GALLERY_VIEW",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Direct streaming endpoint for gallery images (handles data: URLs and private S3 buckets securely)",
    "derived": false,
    "request": {
      "body": [],
      "query": [
        {
          "field": "kind",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/gallery/photo/:id/view."
        }
      ]
    },
    "responses": [],
    "statuses": [],
    "errors": [
      {
        "message": "Gallery is currently disabled by platform policy.",
        "code": "GALLERY_DISABLED"
      },
      {
        "message": "Photo not found.",
        "code": "PHOTO_NOT_FOUND"
      },
      {
        "message": "This photo requires guest publishing consent.",
        "code": "CONSENT_REQUIRED"
      },
      {
        "message": "Image content not available.",
        "code": "IMAGE_NOT_FOUND"
      }
    ],
    "models": [
      "Photo"
    ],
    "tools": [
      {
        "key": "cloudinary",
        "name": "Cloudinary",
        "kind": "media",
        "note": "Image upload, transformation and signed delivery."
      },
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "GET",
    "path": "/api/org/templates",
    "own": "/templates",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1670,
    "permission": "GLOBAL_TEMPLATES_USE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "TEMPLATES (org view of the global library)",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "templates",
            "type": "array",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "Template"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "GET",
    "path": "/api/org/audit",
    "own": "/audit",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1694,
    "permission": "ORG_AUDIT_VIEW",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": "AUDIT (#21–#25)",
    "purpose": "Reads org the audit log. Requires org audit view.",
    "derived": true,
    "request": {
      "body": [],
      "query": [
        {
          "field": "action",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "from",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "limit",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "page",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "severity",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "to",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "items",
            "type": "array",
            "note": null
          },
          {
            "field": "total",
            "type": "any",
            "note": null
          },
          {
            "field": "page",
            "type": "any",
            "note": null
          },
          {
            "field": "pages",
            "type": "any",
            "note": null
          },
          {
            "field": "actors",
            "type": "array",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "AuditLog",
      "User"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "GET",
    "path": "/api/org/template-layouts",
    "own": "/template-layouts",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1726,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": "─── AI TEMPLATES ────────────────────────────────────────────────────────────",
    "purpose": "Reads org template layouts. Public.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "layouts",
            "type": "array",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "TemplateLayout"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "GET",
    "path": "/api/org/ai-templates",
    "own": "/ai-templates",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1847,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "Reads org ai templates. Public.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "templates",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "OrgAiTemplate",
      "OrganizationDefaults"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "POST",
    "path": "/api/org/ai-generate",
    "own": "/ai-generate",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1878,
    "permission": null,
    "writableOrg": true,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "Creates org ai generate. Public. Blocked for read-only or suspended organisations.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "updatedDesign",
            "type": "any",
            "note": null
          },
          {
            "field": "newAssets",
            "type": "any",
            "note": null
          },
          {
            "field": "layout",
            "type": "any",
            "note": null
          },
          {
            "field": "remainingCredits",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 403,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "Organization"
    ],
    "tools": [
      {
        "key": "cloudinary",
        "name": "Cloudinary",
        "kind": "media",
        "note": "Image upload, transformation and signed delivery."
      },
      {
        "key": "s3",
        "name": "AWS S3",
        "kind": "media",
        "note": "Object storage for generated assets."
      },
      {
        "key": "groq",
        "name": "Groq",
        "kind": "ai",
        "note": "openai/gpt-oss-120b — prompt classification and template planning."
      },
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "POST",
    "path": "/api/org/ai-templates",
    "own": "/ai-templates",
    "mounted": true,
    "file": "crm/org.js",
    "line": 1925,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "Creates org ai templates. Public.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "template",
            "type": "object",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "OrgAiTemplate",
      "OrganizationDefaults"
    ],
    "tools": [
      {
        "key": "cloudinary",
        "name": "Cloudinary",
        "kind": "media",
        "note": "Image upload, transformation and signed delivery."
      },
      {
        "key": "s3",
        "name": "AWS S3",
        "kind": "media",
        "note": "Object storage for generated assets."
      },
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "PUT",
    "path": "/api/org/ai-templates/:id",
    "own": "/ai-templates/:id",
    "mounted": true,
    "file": "crm/org.js",
    "line": 2042,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "Replaces org ai templates. Public.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/ai-templates/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 404,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "OrganizationDefaults"
    ],
    "tools": []
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "PATCH",
    "path": "/api/org/ai-templates/:id",
    "own": "/ai-templates/:id",
    "mounted": true,
    "file": "crm/org.js",
    "line": 2043,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "Updates org ai templates. Public.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/ai-templates/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 404,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "OrganizationDefaults"
    ],
    "tools": []
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "DELETE",
    "path": "/api/org/ai-templates/:id",
    "own": "/ai-templates/:id",
    "mounted": true,
    "file": "crm/org.js",
    "line": 2045,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "Deletes org ai templates. Public.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/org/ai-templates/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 404,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "OrganizationDefaults"
    ],
    "tools": []
  },
  {
    "backend": "main",
    "group": "CRM · organisation",
    "method": "POST",
    "path": "/api/org/remove-bg",
    "own": "/remove-bg",
    "mounted": true,
    "file": "crm/org.js",
    "line": 2066,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "Creates org remove bg. Public.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "…",
            "type": "unknown",
            "note": "Additional keys spread from another object."
          },
          {
            "field": "result",
            "type": "any",
            "note": null
          },
          {
            "field": "remainingCredits",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 403,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "Organization"
    ],
    "tools": [
      {
        "key": "sharp",
        "name": "sharp",
        "kind": "local",
        "note": "In-process image resizing and background removal — no network call."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "GET",
    "path": "/api/platform/dashboard",
    "own": "/dashboard",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 113,
    "permission": "PLATFORM_DASHBOARD_VIEW",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": "DASHBOARD",
    "purpose": "Reads platform the dashboard. Requires platform dashboard view.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "orgs",
            "type": "array",
            "note": null
          },
          {
            "field": "devices",
            "type": "array",
            "note": null
          },
          {
            "field": "events",
            "type": "array",
            "note": null
          },
          {
            "field": "expiringSoon",
            "type": "array",
            "note": null
          },
          {
            "field": "nearLimits",
            "type": "array",
            "note": null
          },
          {
            "field": "recentSignups",
            "type": "any",
            "note": null
          },
          {
            "field": "alerts",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "Device",
      "Event",
      "Organization",
      "Subscription"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "GET",
    "path": "/api/platform/revenue",
    "own": "/revenue",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 189,
    "permission": "PLATFORM_REVENUE_VIEW",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "REVENUE (subscription revenue)",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "net",
            "type": "any",
            "note": null
          },
          {
            "field": "fyRevenue",
            "type": "array",
            "note": null
          },
          {
            "field": "monthRevenue",
            "type": "array",
            "note": null
          },
          {
            "field": "monthWise",
            "type": "array",
            "note": null
          },
          {
            "field": "quarterWise",
            "type": "any",
            "note": null
          },
          {
            "field": "orgs",
            "type": "any",
            "note": null
          },
          {
            "field": "yearOptions",
            "type": "array",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "Organization",
      "Subscription"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "GET",
    "path": "/api/platform/organizations",
    "own": "/organizations",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 255,
    "permission": "PLATFORM_ORGS_VIEW",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": "ORGANIZATIONS",
    "purpose": "Reads platform organisations. Requires platform orgs view.",
    "derived": true,
    "request": {
      "body": [],
      "query": [
        {
          "field": "limit",
          "type": "any",
          "required": false,
          "default": "25",
          "note": null
        },
        {
          "field": "page",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "plan",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "search",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "status",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "page",
            "type": "any",
            "note": null
          },
          {
            "field": "limit",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "Organization",
      "Subscription"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "GET",
    "path": "/api/platform/organizations/:id",
    "own": "/organizations/:id",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 272,
    "permission": "PLATFORM_ORGS_VIEW",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Reads platform organisations. Requires platform orgs view.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/platform/organizations/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "…",
            "type": "unknown",
            "note": "Additional keys spread from another object."
          },
          {
            "field": "row",
            "type": "any",
            "note": null
          },
          {
            "field": "plan",
            "type": "object",
            "note": null
          },
          {
            "field": "subscription",
            "type": "any",
            "note": null
          },
          {
            "field": "subscriptions",
            "type": "array",
            "note": null
          },
          {
            "field": "usage",
            "type": "object",
            "note": null
          },
          {
            "field": "devices",
            "type": "any",
            "note": null
          },
          {
            "field": "events",
            "type": "array",
            "note": null
          },
          {
            "field": "revenue",
            "type": "object",
            "note": null
          },
          {
            "field": "limits",
            "type": "object",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Organization not found.",
        "code": "ORG_NOT_FOUND"
      }
    ],
    "models": [
      "Device",
      "Event",
      "Organization",
      "Payment",
      "Subscription"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "GET",
    "path": "/api/platform/plans",
    "own": "/plans",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 426,
    "permission": "SUBSCRIPTION_PLANS_MANAGE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Reads platform plans. Requires subscription plans manage.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "plans",
            "type": "array",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From planAdminView."
          },
          {
            "field": "key",
            "type": "any",
            "note": "From planAdminView."
          },
          {
            "field": "name",
            "type": "any",
            "note": "From planAdminView."
          },
          {
            "field": "description",
            "type": "any",
            "note": "From planAdminView."
          },
          {
            "field": "kind",
            "type": "any",
            "note": "From planAdminView."
          },
          {
            "field": "priceMonthly",
            "type": "any",
            "note": "From planAdminView."
          },
          {
            "field": "priceQuarterly",
            "type": "any",
            "note": "From planAdminView."
          },
          {
            "field": "priceSemiannual",
            "type": "any",
            "note": "From planAdminView."
          },
          {
            "field": "priceAnnual",
            "type": "any",
            "note": "From planAdminView."
          },
          {
            "field": "billingNote",
            "type": "any",
            "note": "From planAdminView."
          },
          {
            "field": "aiCredits",
            "type": "number",
            "note": "From planAdminView."
          },
          {
            "field": "billing",
            "type": "any",
            "note": "From planAdminView."
          },
          {
            "field": "price",
            "type": "any",
            "note": "From planAdminView."
          },
          {
            "field": "discountStartsAt",
            "type": "any",
            "note": "From planAdminView."
          },
          {
            "field": "discountEndsAt",
            "type": "any",
            "note": "From planAdminView."
          },
          {
            "field": "pricing",
            "type": "any",
            "note": "From planAdminView."
          },
          {
            "field": "durationMonths",
            "type": "any",
            "note": "From planAdminView."
          },
          {
            "field": "durationLabel",
            "type": "any",
            "note": "From planAdminView."
          },
          {
            "field": "devices",
            "type": "any",
            "note": "From planAdminView."
          },
          {
            "field": "events",
            "type": "any",
            "note": "From planAdminView."
          },
          {
            "field": "active",
            "type": "boolean",
            "note": "From planAdminView."
          },
          {
            "field": "organizations",
            "type": "number",
            "note": "From planAdminView."
          },
          {
            "field": "subscriptions",
            "type": "number",
            "note": "From planAdminView."
          },
          {
            "field": "updatedAt",
            "type": "any",
            "note": "From planAdminView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "Organization",
      "Subscription",
      "SubscriptionPlan"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "POST",
    "path": "/api/platform/plans",
    "own": "/plans",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 443,
    "permission": "SUBSCRIPTION_PLANS_MANAGE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates platform plans. Requires subscription plans manage.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "active",
          "type": "boolean",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "aiCredits",
          "type": "number",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "billingNote",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "description",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "devices",
          "type": "number",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "durationLabel",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "durationMonths",
          "type": "number",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "events",
          "type": "number",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "key",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "kind",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "name",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "price",
          "type": "number",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "priceAnnual",
          "type": "number",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "priceMonthly",
          "type": "number",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "priceQuarterly",
          "type": "number",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "priceSemiannual",
          "type": "number",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 201,
        "fields": [
          {
            "field": "plan",
            "type": "object",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      201
    ],
    "errors": [
      {
        "message": "Plan key may contain lowercase letters, numbers and single hyphens.",
        "code": "BAD_PLAN_KEY"
      },
      {
        "message": "A plan with this key already exists.",
        "code": "PLAN_EXISTS"
      }
    ],
    "models": [
      "SubscriptionPlan"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "PUT",
    "path": "/api/platform/plans/:id",
    "own": "/plans/:id",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 474,
    "permission": "SUBSCRIPTION_PLANS_MANAGE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Replaces platform plans. Requires subscription plans manage.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "active",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "aiCredits",
          "type": "number",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "billingNote",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "discountEndsAt",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "discountLabel",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "discountMaxRedemptions",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "discountStartsAt",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "discountType",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "discountValue",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "durationMonths",
          "type": "number",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "kind",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "price",
          "type": "number",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/platform/plans/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "plan",
            "type": "object",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Subscription plan not found.",
        "code": "PLAN_NOT_FOUND"
      }
    ],
    "models": [
      "SubscriptionPlan"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "DELETE",
    "path": "/api/platform/plans/:id",
    "own": "/plans/:id",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 532,
    "permission": "SUBSCRIPTION_PLANS_MANAGE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Deletes platform plans. Requires subscription plans manage.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/platform/plans/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          },
          {
            "field": "deleted",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Subscription plan or add-on not found.",
        "code": "PLAN_NOT_FOUND"
      },
      {
        "message": "The default trial plan cannot be deleted as it is required for new organization onboarding.",
        "code": "CANNOT_DELETE_TRIAL"
      }
    ],
    "models": [
      "Organization",
      "SubscriptionPlan"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "GET",
    "path": "/api/platform/gallery-settings",
    "own": "/gallery-settings",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 604,
    "permission": "PLATFORM_GALLERY_SETTINGS",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": "GALLERY SETTINGS (#12, #13, #16–#20)",
    "purpose": "Reads platform gallery settings. Requires platform gallery settings.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [],
    "statuses": [],
    "errors": [],
    "models": [],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "PUT",
    "path": "/api/platform/gallery-settings",
    "own": "/gallery-settings",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 609,
    "permission": "PLATFORM_GALLERY_SETTINGS",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Replaces platform gallery settings. Requires platform gallery settings.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "galleryEnabled",
          "type": "boolean",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "requireGuestConsent",
          "type": "boolean",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "settings",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "GET",
    "path": "/api/platform/users",
    "own": "/users",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 642,
    "permission": "PLATFORM_TEAM_VIEW",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Reads platform users. Requires platform team view.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "users",
            "type": "array",
            "note": null
          },
          {
            "field": "canManage",
            "type": "any",
            "note": null
          },
          {
            "field": "readOnly",
            "type": "any",
            "note": null
          },
          {
            "field": "roles",
            "type": "array",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "User"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "POST",
    "path": "/api/platform/users",
    "own": "/users",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 654,
    "permission": "PLATFORM_USERS_MANAGE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates platform users. Requires platform users manage.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "name",
          "type": "string",
          "required": true,
          "default": null,
          "note": null
        },
        {
          "field": "email",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "password",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "role",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 201,
        "fields": [
          {
            "field": "user",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From internalUserView."
          },
          {
            "field": "name",
            "type": "any",
            "note": "From internalUserView."
          },
          {
            "field": "email",
            "type": "any",
            "note": "From internalUserView."
          },
          {
            "field": "role",
            "type": "any",
            "note": "From internalUserView."
          },
          {
            "field": "roleLabel",
            "type": "any",
            "note": "From internalUserView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From internalUserView."
          },
          {
            "field": "lastLoginAt",
            "type": "any",
            "note": "From internalUserView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From internalUserView."
          }
        ]
      }
    ],
    "statuses": [
      201
    ],
    "errors": [
      {
        "message": "Name, email and password are required.",
        "code": "BAD_USER"
      },
      {
        "message": "Only Platform Admin and Support Manager accounts can be created from CRM. Owner is a single bootstrap account.",
        "code": "BAD_ROLE"
      },
      {
        "message": "Password must be at least 8 characters and contain a letter and a number.",
        "code": "WEAK_PASSWORD"
      },
      {
        "message": "A user with this email already exists.",
        "code": "EMAIL_TAKEN"
      }
    ],
    "models": [
      "User"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "PUT",
    "path": "/api/platform/users/:id",
    "own": "/users/:id",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 672,
    "permission": "PLATFORM_USERS_MANAGE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Replaces platform users. Requires platform users manage.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "status",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/platform/users/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "user",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From internalUserView."
          },
          {
            "field": "name",
            "type": "any",
            "note": "From internalUserView."
          },
          {
            "field": "email",
            "type": "any",
            "note": "From internalUserView."
          },
          {
            "field": "role",
            "type": "any",
            "note": "From internalUserView."
          },
          {
            "field": "roleLabel",
            "type": "any",
            "note": "From internalUserView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From internalUserView."
          },
          {
            "field": "lastLoginAt",
            "type": "any",
            "note": "From internalUserView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From internalUserView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "User not found.",
        "code": "USER_NOT_FOUND"
      },
      {
        "message": "Team members manage their own identity — only activation status can be changed here.",
        "code": "IDENTITY_IMMUTABLE"
      },
      {
        "message": "Status must be active or inactive.",
        "code": "BAD_STATUS"
      },
      {
        "message": "You cannot deactivate your own account.",
        "code": "SELF_DEACTIVATE"
      }
    ],
    "models": [
      "User"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "GET",
    "path": "/api/platform/support",
    "own": "/support",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 741,
    "permission": "PLATFORM_SUPPORT_VIEW",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Reads platform support. Requires platform support view.",
    "derived": true,
    "request": {
      "body": [],
      "query": [
        {
          "field": "limit",
          "type": "any",
          "required": false,
          "default": "20",
          "note": null
        },
        {
          "field": "page",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "search",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "status",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "…",
            "type": "unknown",
            "note": "Additional keys spread from another object."
          },
          {
            "field": "page",
            "type": "any",
            "note": null
          },
          {
            "field": "requests",
            "type": "any",
            "note": null
          },
          {
            "field": "counts",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From supportView."
          },
          {
            "field": "ticketNo",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "subject",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "category",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "priority",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "organization",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "createdBy",
            "type": "string",
            "note": "From supportView."
          },
          {
            "field": "messages",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "decision",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "lastReapplication",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "reapplyCount",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "resolution",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "updatedAt",
            "type": "any",
            "note": "From supportView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "Organization",
      "PlatformSupportRequest"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "GET",
    "path": "/api/platform/support/:id",
    "own": "/support/:id",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 761,
    "permission": "PLATFORM_SUPPORT_VIEW",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Reads platform support. Requires platform support view.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/platform/support/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "request",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From supportView."
          },
          {
            "field": "ticketNo",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "subject",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "category",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "priority",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "organization",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "createdBy",
            "type": "string",
            "note": "From supportView."
          },
          {
            "field": "messages",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "decision",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "lastReapplication",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "reapplyCount",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "resolution",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "updatedAt",
            "type": "any",
            "note": "From supportView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Support request not found.",
        "code": "SUPPORT_REQUEST_NOT_FOUND"
      }
    ],
    "models": [
      "Organization",
      "PlatformSupportRequest",
      "User"
    ],
    "tools": []
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "POST",
    "path": "/api/platform/support/:id/accept",
    "own": "/support/:id/accept",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 790,
    "permission": "PLATFORM_SUPPORT_VIEW",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates support accept. Requires platform support view.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "images",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "message",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/platform/support/:id/accept."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "request",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From supportView."
          },
          {
            "field": "ticketNo",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "subject",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "category",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "priority",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "organization",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "createdBy",
            "type": "string",
            "note": "From supportView."
          },
          {
            "field": "messages",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "decision",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "lastReapplication",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "reapplyCount",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "resolution",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "updatedAt",
            "type": "any",
            "note": "From supportView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Support request not found.",
        "code": "SUPPORT_REQUEST_NOT_FOUND"
      },
      {
        "message": "Only a new request can be accepted.",
        "code": "TICKET_NOT_NEW"
      }
    ],
    "models": [
      "Organization",
      "PlatformSupportRequest"
    ],
    "tools": []
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "POST",
    "path": "/api/platform/support/:id/deny",
    "own": "/support/:id/deny",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 807,
    "permission": "PLATFORM_SUPPORT_VIEW",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates support deny. Requires platform support view.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "reason",
          "type": "string",
          "required": true,
          "default": null,
          "note": "A reason is required to deny a request."
        },
        {
          "field": "images",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "message",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/platform/support/:id/deny."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "request",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From supportView."
          },
          {
            "field": "ticketNo",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "subject",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "category",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "priority",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "organization",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "createdBy",
            "type": "string",
            "note": "From supportView."
          },
          {
            "field": "messages",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "decision",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "lastReapplication",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "reapplyCount",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "resolution",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "updatedAt",
            "type": "any",
            "note": "From supportView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Support request not found.",
        "code": "SUPPORT_REQUEST_NOT_FOUND"
      },
      {
        "message": "A resolved request cannot be denied.",
        "code": "TICKET_RESOLVED"
      },
      {
        "message": "A reason is required to deny a request.",
        "code": "REASON_REQUIRED"
      }
    ],
    "models": [
      "Organization",
      "PlatformSupportRequest"
    ],
    "tools": []
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "POST",
    "path": "/api/platform/support/:id/reply",
    "own": "/support/:id/reply",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 823,
    "permission": "PLATFORM_SUPPORT_VIEW",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates support reply. Requires platform support view.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "text",
          "type": "any",
          "required": true,
          "default": null,
          "note": null
        },
        {
          "field": "images",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "message",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/platform/support/:id/reply."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "request",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From supportView."
          },
          {
            "field": "ticketNo",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "subject",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "category",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "priority",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "organization",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "createdBy",
            "type": "string",
            "note": "From supportView."
          },
          {
            "field": "messages",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "decision",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "lastReapplication",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "reapplyCount",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "resolution",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "updatedAt",
            "type": "any",
            "note": "From supportView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Support request not found.",
        "code": "SUPPORT_REQUEST_NOT_FOUND"
      },
      {
        "message": "Reply on an accepted, active ticket.",
        "code": "TICKET_NOT_OPEN"
      },
      {
        "message": "A message or image attachment is required.",
        "code": "EMPTY_MESSAGE"
      }
    ],
    "models": [
      "Organization",
      "PlatformSupportRequest"
    ],
    "tools": []
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "POST",
    "path": "/api/platform/support/:id/resolve",
    "own": "/support/:id/resolve",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 837,
    "permission": "PLATFORM_SUPPORT_VIEW",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates support resolve. Requires platform support view.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "images",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "message",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "resolution",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/platform/support/:id/resolve."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "request",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From supportView."
          },
          {
            "field": "ticketNo",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "subject",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "category",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "priority",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "organization",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "createdBy",
            "type": "string",
            "note": "From supportView."
          },
          {
            "field": "messages",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "decision",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "lastReapplication",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "reapplyCount",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "resolution",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "updatedAt",
            "type": "any",
            "note": "From supportView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Support request not found.",
        "code": "SUPPORT_REQUEST_NOT_FOUND"
      }
    ],
    "models": [
      "Organization",
      "PlatformSupportRequest"
    ],
    "tools": []
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "POST",
    "path": "/api/platform/support/:id/reopen",
    "own": "/support/:id/reopen",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 851,
    "permission": "PLATFORM_SUPPORT_VIEW",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates support reopen. Requires platform support view.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "images",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "message",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/platform/support/:id/reopen."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "request",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From supportView."
          },
          {
            "field": "ticketNo",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "subject",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "category",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "priority",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "organization",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "createdBy",
            "type": "string",
            "note": "From supportView."
          },
          {
            "field": "messages",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "decision",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "lastReapplication",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "reapplyCount",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "resolution",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From supportView."
          },
          {
            "field": "updatedAt",
            "type": "any",
            "note": "From supportView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Support request not found.",
        "code": "SUPPORT_REQUEST_NOT_FOUND"
      },
      {
        "message": "Only a resolved request can be reopened.",
        "code": "TICKET_NOT_RESOLVED"
      }
    ],
    "models": [
      "Organization",
      "PlatformSupportRequest"
    ],
    "tools": []
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "GET",
    "path": "/api/platform/templates",
    "own": "/templates",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 871,
    "permission": "GLOBAL_TEMPLATES_MANAGE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "TEMPLATES (global library)",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "templates",
            "type": "array",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "Template"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "POST",
    "path": "/api/platform/templates",
    "own": "/templates",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 893,
    "permission": "GLOBAL_TEMPLATES_MANAGE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates platform templates. Requires global templates manage.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "layoutId",
          "type": "any",
          "required": true,
          "default": null,
          "note": "A layout variant is required."
        },
        {
          "field": "name",
          "type": "string",
          "required": true,
          "default": null,
          "note": "Template name is required."
        },
        {
          "field": "active",
          "type": "boolean",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "category",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "componentId",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "description",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "design",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "price",
          "type": "number",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "source",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 201,
        "fields": [
          {
            "field": "template",
            "type": "object",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      201
    ],
    "errors": [
      {
        "message": "Template name is required.",
        "code": "BAD_TEMPLATE"
      },
      {
        "message": "A layout variant is required.",
        "code": "BAD_TEMPLATE"
      }
    ],
    "models": [
      "Template"
    ],
    "tools": []
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "PUT",
    "path": "/api/platform/templates/:id",
    "own": "/templates/:id",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 916,
    "permission": "GLOBAL_TEMPLATES_MANAGE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Replaces platform templates. Requires global templates manage.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "active",
          "type": "boolean",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "componentId",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "design",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "layoutId",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "price",
          "type": "number",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "source",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/platform/templates/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "template",
            "type": "object",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Template not found.",
        "code": "TEMPLATE_NOT_FOUND"
      },
      {
        "message": "This template is used by events — its layout cannot change.",
        "code": "TEMPLATE_IN_USE"
      }
    ],
    "models": [
      "Event",
      "Template"
    ],
    "tools": []
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "DELETE",
    "path": "/api/platform/templates/:id",
    "own": "/templates/:id",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 950,
    "permission": "GLOBAL_TEMPLATES_MANAGE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Deletes platform templates. Requires global templates manage.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/platform/templates/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Template not found.",
        "code": "TEMPLATE_NOT_FOUND"
      },
      {
        "message": "This template is used by events. Unpublish it instead of deleting.",
        "code": "TEMPLATE_IN_USE"
      }
    ],
    "models": [
      "Event",
      "Template"
    ],
    "tools": []
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "POST",
    "path": "/api/platform/templates/ai-generate",
    "own": "/templates/ai-generate",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 961,
    "permission": "GLOBAL_TEMPLATES_MANAGE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates templates ai generate. Requires global templates manage.",
    "derived": true,
    "request": {
      "body": [
        {
          "field": "layoutId",
          "type": "any",
          "required": true,
          "default": null,
          "note": "A layout variant is required."
        },
        {
          "field": "prompt",
          "type": "string",
          "required": true,
          "default": null,
          "note": "A prompt is required."
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "draft",
            "type": "object",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "A prompt is required.",
        "code": "BAD_PROMPT"
      },
      {
        "message": "A layout variant is required.",
        "code": "BAD_TEMPLATE"
      }
    ],
    "models": [],
    "tools": []
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "GET",
    "path": "/api/platform/audit",
    "own": "/audit",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 1000,
    "permission": "PLATFORM_AUDIT_VIEW",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": "AUDIT (#21–#25)",
    "purpose": "Reads platform the audit log. Requires platform audit view.",
    "derived": true,
    "request": {
      "body": [],
      "query": [
        {
          "field": "action",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "actor",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "from",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "limit",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "page",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "scope",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "severity",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "to",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "items",
            "type": "array",
            "note": null
          },
          {
            "field": "page",
            "type": "any",
            "note": null
          },
          {
            "field": "pages",
            "type": "any",
            "note": null
          },
          {
            "field": "actors",
            "type": "array",
            "note": null
          },
          {
            "field": "organizations",
            "type": "array",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "AuditLog",
      "Organization",
      "User"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "GET",
    "path": "/api/platform/template-layouts",
    "own": "/template-layouts",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 1075,
    "permission": "PLATFORM_TEMPLATE_LAYOUTS_MANAGE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": "─── TEMPLATE LAYOUTS ────────────────────────────────────────────────────────",
    "purpose": "Reads platform template layouts. Requires platform template layouts manage.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "layouts",
            "type": "array",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "TemplateLayout"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "POST",
    "path": "/api/platform/template-layouts",
    "own": "/template-layouts",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 1080,
    "permission": "PLATFORM_TEMPLATE_LAYOUTS_MANAGE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Creates platform template layouts. Requires platform template layouts manage.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 201,
        "fields": [
          {
            "field": "layout",
            "type": "object",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      201
    ],
    "errors": [],
    "models": [
      "TemplateLayout"
    ],
    "tools": []
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "DELETE",
    "path": "/api/platform/template-layouts/:id",
    "own": "/template-layouts/:id",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 1086,
    "permission": "PLATFORM_TEMPLATE_LAYOUTS_MANAGE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Deletes platform template layouts. Requires platform template layouts manage.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/platform/template-layouts/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Template layout not found",
        "code": null
      }
    ],
    "models": [],
    "tools": []
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "GET",
    "path": "/api/platform/leads",
    "own": "/leads",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 1115,
    "permission": "PLATFORM_LEADS_MANAGE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Reads platform website leads. Requires platform leads manage.",
    "derived": true,
    "request": {
      "body": [],
      "query": [
        {
          "field": "q",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "status",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "type",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "leads",
            "type": "array",
            "note": null
          },
          {
            "field": "counts",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "WebsiteLead"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "PUT",
    "path": "/api/platform/leads/:id",
    "own": "/leads/:id",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 1167,
    "permission": "PLATFORM_LEADS_MANAGE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Replaces platform website leads. Requires platform leads manage.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/platform/leads/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "lead",
            "type": "any",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": "From leadView."
          },
          {
            "field": "name",
            "type": "any",
            "note": "From leadView."
          },
          {
            "field": "email",
            "type": "any",
            "note": "From leadView."
          },
          {
            "field": "phone",
            "type": "any",
            "note": "From leadView."
          },
          {
            "field": "company",
            "type": "any",
            "note": "From leadView."
          },
          {
            "field": "message",
            "type": "any",
            "note": "From leadView."
          },
          {
            "field": "type",
            "type": "any",
            "note": "From leadView."
          },
          {
            "field": "status",
            "type": "any",
            "note": "From leadView."
          },
          {
            "field": "notes",
            "type": "any",
            "note": "From leadView."
          },
          {
            "field": "contactedAt",
            "type": "any",
            "note": "From leadView."
          },
          {
            "field": "closedAt",
            "type": "any",
            "note": "From leadView."
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": "From leadView."
          },
          {
            "field": "updatedAt",
            "type": "any",
            "note": "From leadView."
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Lead not found",
        "code": null
      },
      {
        "message": "Lead not found",
        "code": null
      },
      {
        "message": "Invalid lead status",
        "code": null
      },
      {
        "message": "Invalid lead type",
        "code": null
      }
    ],
    "models": [
      "WebsiteLead"
    ],
    "tools": []
  },
  {
    "backend": "main",
    "group": "CRM · platform",
    "method": "DELETE",
    "path": "/api/platform/leads/:id",
    "own": "/leads/:id",
    "mounted": true,
    "file": "crm/platform.js",
    "line": 1211,
    "permission": "PLATFORM_LEADS_MANAGE",
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "Deletes platform website leads. Requires platform leads manage.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/platform/leads/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "message": "Lead not found",
        "code": null
      },
      {
        "message": "Lead not found",
        "code": null
      }
    ],
    "models": [],
    "tools": []
  },
  {
    "backend": "main",
    "group": "Devices",
    "method": "POST",
    "path": "/api/devices/booth-login",
    "own": "/booth-login",
    "mounted": true,
    "file": "deviceRoutes.js",
    "line": 37,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "New flow: When a device first starts, it shows a \"Client Login\" screen. Client enters their org credentials → device gets linked. Token is stored in the booth app's local storage (persistent). Body: { orgId, password } Response: { deviceToken, deviceId, deviceName, currentEventId }",
    "derived": false,
    "request": {
      "body": [
        {
          "field": "deviceUuid",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 201,
        "fields": [
          {
            "field": "message",
            "type": "string",
            "note": null
          },
          {
            "field": "deviceToken",
            "type": "any",
            "note": null
          },
          {
            "field": "deviceUuid",
            "type": "any",
            "note": null
          },
          {
            "field": "deviceName",
            "type": "any",
            "note": null
          },
          {
            "field": "currentEventId",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      201
    ],
    "errors": [
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 401,
        "message": null,
        "code": null
      },
      {
        "status": 401,
        "message": null,
        "code": null
      },
      {
        "status": 404,
        "message": null,
        "code": null
      },
      {
        "status": 403,
        "message": null,
        "code": null
      },
      {
        "status": 403,
        "message": null,
        "code": null
      },
      {
        "status": 201,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "Device",
      "Organization",
      "User"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Devices",
    "method": "POST",
    "path": "/api/devices/ping",
    "own": "/ping",
    "mounted": true,
    "file": "deviceRoutes.js",
    "line": 115,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": true,
    "auth": false,
    "section": null,
    "purpose": "PUBLIC: Heartbeat Ping (called every 30s by booth app) POST /api/devices/ping Header: x-device-token: hp_dev_xxx... Also returns currentEventId so booth can detect event changes",
    "derived": false,
    "request": {
      "body": [
        {
          "field": "connections",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "hardware",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "hardwarePatch",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "telemetry",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "ok",
            "type": "boolean",
            "note": null
          },
          {
            "field": "deviceName",
            "type": "any",
            "note": null
          },
          {
            "field": "organizationId",
            "type": "any",
            "note": null
          },
          {
            "field": "status",
            "type": "any",
            "note": null
          },
          {
            "field": "currentEventId",
            "type": "any",
            "note": null
          },
          {
            "field": "currentEventName",
            "type": "any",
            "note": null
          },
          {
            "field": "needsMaintenance",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Devices",
    "method": "GET",
    "path": "/api/devices/current-event",
    "own": "/current-event",
    "mounted": true,
    "file": "deviceRoutes.js",
    "line": 160,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": true,
    "auth": false,
    "section": null,
    "purpose": "PUBLIC: Get current event for this device (polled every 30s) GET /api/devices/current-event Header: x-device-token: hp_dev_xxx... Returns event details if assigned, null if not",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "event",
            "type": "null",
            "note": null
          },
          {
            "field": "deviceId",
            "type": "any",
            "note": null
          },
          {
            "field": "deviceName",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "Event"
    ],
    "tools": []
  },
  {
    "backend": "main",
    "group": "Platform docs",
    "method": "GET",
    "path": "/api/docs/private",
    "own": "/private",
    "mounted": true,
    "file": "documentationRoutes.js",
    "line": 922,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "Reads the docs payload. Public.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "navigationTitle",
            "type": "string",
            "note": null
          },
          {
            "field": "generated",
            "type": "array",
            "note": null
          },
          {
            "field": "pages",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [],
    "tools": []
  },
  {
    "backend": "main",
    "group": "Guest downloads",
    "method": "GET",
    "path": "/api/downloads/:id",
    "own": "/:id",
    "mounted": true,
    "file": "downloadRoutes.js",
    "line": 38,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "─── GET /api/downloads/:id ────────────────────────────────── Returns session metadata and signed photo URLs (valid for 24h)",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/downloads/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "downloadId",
            "type": "string",
            "note": null
          },
          {
            "field": "compositeUrl",
            "type": "string",
            "note": null
          },
          {
            "field": "photoUrls",
            "type": "array",
            "note": null
          },
          {
            "field": "eventName",
            "type": "string",
            "note": null
          },
          {
            "field": "organizationName",
            "type": "string",
            "note": null
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": null
          },
          {
            "field": "expiresAt",
            "type": "any",
            "note": null
          },
          {
            "field": "remainingMs",
            "type": "any",
            "note": null
          },
          {
            "field": "downloadCount",
            "type": "number",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "GuestDownload"
    ],
    "tools": [
      {
        "key": "cloudinary",
        "name": "Cloudinary",
        "kind": "media",
        "note": "Image upload, transformation and signed delivery."
      },
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      },
      {
        "key": "s3",
        "name": "AWS S3",
        "kind": "media",
        "note": "Object storage for generated assets."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Guest downloads",
    "method": "GET",
    "path": "/api/downloads/:id/file/:kind",
    "own": "/:id/file/:kind",
    "mounted": true,
    "file": "downloadRoutes.js",
    "line": 89,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "─── GET /api/downloads/:id/file/:kind ──────────────────────── kind = 'composite' or 0-based photo index",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/downloads/:id/file/:kind."
        },
        {
          "field": "kind",
          "note": "Path parameter from /api/downloads/:id/file/:kind."
        }
      ]
    },
    "responses": [],
    "statuses": [],
    "errors": [],
    "models": [
      "GuestDownload"
    ],
    "tools": [
      {
        "key": "cloudinary",
        "name": "Cloudinary",
        "kind": "media",
        "note": "Image upload, transformation and signed delivery."
      },
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      },
      {
        "key": "s3",
        "name": "AWS S3",
        "kind": "media",
        "note": "Object storage for generated assets."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Guest downloads",
    "method": "POST",
    "path": "/api/downloads/internal",
    "own": "/internal",
    "mounted": true,
    "file": "downloadRoutes.js",
    "line": 147,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "─── POST /api/downloads/internal ───────────────────────────── Mint a download from internal services",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "downloadId",
            "type": "any",
            "note": null
          },
          {
            "field": "url",
            "type": "string",
            "note": null
          },
          {
            "field": "expiresAt",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "GuestDownload"
    ],
    "tools": []
  },
  {
    "backend": "main",
    "group": "Events",
    "method": "GET",
    "path": "/api/events/public/live",
    "own": "/public/live",
    "mounted": true,
    "file": "eventRoutes.js",
    "line": 68,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": true,
    "auth": false,
    "section": null,
    "purpose": "GET /api/events/public/live — Public route for photobooth client to fetch active event (Legacy)",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "…",
            "type": "unknown",
            "note": "Additional keys spread from another object."
          },
          {
            "field": "eventData",
            "type": "any",
            "note": null
          },
          {
            "field": "status",
            "type": "any",
            "note": null
          },
          {
            "field": "layoutPrices",
            "type": "any",
            "note": null
          },
          {
            "field": "overrideTemplatePrices",
            "type": "boolean",
            "note": null
          },
          {
            "field": "templatePrices",
            "type": "any",
            "note": null
          },
          {
            "field": "branding",
            "type": "any",
            "note": null
          },
          {
            "field": "templates",
            "type": "array",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 404,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "Event",
      "OrganizationDefaults"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Events",
    "method": "GET",
    "path": "/api/events/public/list",
    "own": "/public/list",
    "mounted": true,
    "file": "eventRoutes.js",
    "line": 113,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": true,
    "auth": false,
    "section": null,
    "purpose": "GET /api/events/public/list — Fetch live/upcoming events for Join Screen (Scoped to Device's Org)",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [],
    "statuses": [],
    "errors": [
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "Event"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Events",
    "method": "POST",
    "path": "/api/events/public/join",
    "own": "/public/join",
    "mounted": true,
    "file": "eventRoutes.js",
    "line": 130,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "POST /api/events/public/join — Verify passkey and return event details",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [],
    "statuses": [],
    "errors": [
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 404,
        "message": null,
        "code": null
      },
      {
        "status": 401,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "Event"
    ],
    "tools": []
  },
  {
    "backend": "main",
    "group": "Payments",
    "method": "POST",
    "path": "/api/payments/create-order",
    "own": "/create-order",
    "mounted": true,
    "file": "paymentRoutes.js",
    "line": 286,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": true,
    "auth": false,
    "section": null,
    "purpose": "PUBLIC: Create Payment Order (Razorpay primary, Cashfree fallback or vice versa) POST /api/payments/create-order",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 201,
        "fields": [
          {
            "field": "orderId",
            "type": "any",
            "note": null
          },
          {
            "field": "paymentId",
            "type": "any",
            "note": null
          },
          {
            "field": "amount",
            "type": "any",
            "note": null
          },
          {
            "field": "currency",
            "type": "string",
            "note": null
          },
          {
            "field": "key",
            "type": "any",
            "note": null
          },
          {
            "field": "paymentLinkUrl",
            "type": "any",
            "note": null
          },
          {
            "field": "isImageUrl",
            "type": "any",
            "note": null
          },
          {
            "field": "gateway",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      201
    ],
    "errors": [
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 502,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "Event"
    ],
    "tools": [
      {
        "key": "razorpay",
        "name": "Razorpay",
        "kind": "payments",
        "note": "Order creation and signature verification."
      },
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Payments",
    "method": "GET",
    "path": "/api/payments/status/:paymentId",
    "own": "/status/:paymentId",
    "mounted": true,
    "file": "paymentRoutes.js",
    "line": 484,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": true,
    "auth": false,
    "section": null,
    "purpose": "PUBLIC: Check Payment Status (Polling endpoint for frictionless payment) GET /api/payments/status/:paymentId",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "paymentId",
          "note": "Path parameter from /api/payments/status/:paymentId."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "success",
            "type": "boolean",
            "note": null
          },
          {
            "field": "status",
            "type": "string",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 404,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "Payment"
    ],
    "tools": [
      {
        "key": "razorpay",
        "name": "Razorpay",
        "kind": "payments",
        "note": "Order creation and signature verification."
      },
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Payments",
    "method": "POST",
    "path": "/api/payments/verify",
    "own": "/verify",
    "mounted": true,
    "file": "paymentRoutes.js",
    "line": 577,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": true,
    "auth": false,
    "section": null,
    "purpose": "PUBLIC: Verify Razorpay Payment (client calls after Razorpay success) POST /api/payments/verify",
    "derived": false,
    "request": {
      "body": [
        {
          "field": "compositeUrl",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "photoUrls",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "success",
            "type": "boolean",
            "note": null
          },
          {
            "field": "paymentId",
            "type": "any",
            "note": null
          },
          {
            "field": "qrToken",
            "type": "any",
            "note": null
          },
          {
            "field": "qrUrl",
            "type": "any",
            "note": null
          },
          {
            "field": "tokenExpiresAt",
            "type": "any",
            "note": null
          },
          {
            "field": "shareToken",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 404,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "Payment"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Payments",
    "method": "POST",
    "path": "/api/payments/cashfree-webhook",
    "own": "/cashfree-webhook",
    "mounted": true,
    "file": "paymentRoutes.js",
    "line": 651,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "PUBLIC: Cashfree Webhook POST /api/payments/cashfree-webhook",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [],
    "statuses": [],
    "errors": [],
    "models": [],
    "tools": []
  },
  {
    "backend": "main",
    "group": "Payments",
    "method": "POST",
    "path": "/api/payments/razorpay-webhook",
    "own": "/razorpay-webhook",
    "mounted": true,
    "file": "paymentRoutes.js",
    "line": 724,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "PUBLIC: Razorpay Webhook POST /api/payments/razorpay-webhook",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [],
    "statuses": [],
    "errors": [],
    "models": [],
    "tools": []
  },
  {
    "backend": "main",
    "group": "Payments",
    "method": "POST",
    "path": "/api/payments/free-complete",
    "own": "/free-complete",
    "mounted": true,
    "file": "paymentRoutes.js",
    "line": 798,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": true,
    "auth": false,
    "section": null,
    "purpose": "PUBLIC: Complete Free Order (finalPrice === 0) POST /api/payments/free-complete",
    "derived": false,
    "request": {
      "body": [
        {
          "field": "length",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "preShoot",
          "type": "boolean",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 201,
        "fields": [
          {
            "field": "success",
            "type": "boolean",
            "note": null
          },
          {
            "field": "paymentId",
            "type": "any",
            "note": null
          },
          {
            "field": "qrToken",
            "type": "any",
            "note": null
          },
          {
            "field": "qrUrl",
            "type": "any",
            "note": null
          },
          {
            "field": "tokenExpiresAt",
            "type": "any",
            "note": null
          },
          {
            "field": "shareToken",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      201
    ],
    "errors": [
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "Event",
      "Payment"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Payments",
    "method": "POST",
    "path": "/api/payments/complete-prepaid",
    "own": "/complete-prepaid",
    "mounted": true,
    "file": "paymentRoutes.js",
    "line": 913,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": true,
    "auth": false,
    "section": null,
    "purpose": "PUBLIC: Complete Prepaid Order (post-shoot update) POST /api/payments/complete-prepaid",
    "derived": false,
    "request": {
      "body": [
        {
          "field": "length",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "success",
            "type": "boolean",
            "note": null
          },
          {
            "field": "qrToken",
            "type": "any",
            "note": null
          },
          {
            "field": "qrUrl",
            "type": "any",
            "note": null
          },
          {
            "field": "tokenExpiresAt",
            "type": "any",
            "note": null
          },
          {
            "field": "shareToken",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 404,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "Payment"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Payments",
    "method": "GET",
    "path": "/api/payments/download/:token",
    "own": "/download/:token",
    "mounted": true,
    "file": "paymentRoutes.js",
    "line": 967,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "PUBLIC: Get photos by download token GET /api/payments/download/:token",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "token",
          "note": "Path parameter from /api/payments/download/:token."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "photoUrls",
            "type": "any",
            "note": null
          },
          {
            "field": "compositeUrl",
            "type": "any",
            "note": null
          },
          {
            "field": "expiresAt",
            "type": "any",
            "note": null
          },
          {
            "field": "downloadCount",
            "type": "number",
            "note": null
          },
          {
            "field": "enableMobilePrinting",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 404,
        "message": null,
        "code": null
      },
      {
        "status": 410,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "DigitalToken"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Sharing",
    "method": "POST",
    "path": "/api/share/generate",
    "own": "/generate",
    "mounted": true,
    "file": "photoShareRoutes.js",
    "line": 31,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": true,
    "auth": false,
    "section": null,
    "purpose": "POST /api/share/generate (Internal / Booth App) Generates a PhotoShare token",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 201,
        "fields": [
          {
            "field": "success",
            "type": "boolean",
            "note": null
          },
          {
            "field": "token",
            "type": "any",
            "note": null
          },
          {
            "field": "expiresAt",
            "type": "any",
            "note": null
          },
          {
            "field": "shareUrl",
            "type": "string",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      201
    ],
    "errors": [
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 404,
        "message": null,
        "code": null
      },
      {
        "status": 403,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "Event"
    ],
    "tools": []
  },
  {
    "backend": "main",
    "group": "Sharing",
    "method": "PUT",
    "path": "/api/share/:token",
    "own": "/:token",
    "mounted": true,
    "file": "photoShareRoutes.js",
    "line": 91,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": true,
    "auth": false,
    "section": null,
    "purpose": "PUT /api/share/:token (Internal / Booth App) Updates an existing PhotoShare with uploaded URLs",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "token",
          "note": "Path parameter from /api/share/:token."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "success",
            "type": "boolean",
            "note": null
          },
          {
            "field": "photoShare",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 404,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "PhotoShare"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Sharing",
    "method": "GET",
    "path": "/api/share/view/:token",
    "own": "/view/:token",
    "mounted": true,
    "file": "photoShareRoutes.js",
    "line": 116,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "GET /api/share/view/:token (Public - Mobile View Page) Validates token and returns photos (Tenant Isolated - no sensitive data)",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "token",
          "note": "Path parameter from /api/share/view/:token."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "success",
            "type": "boolean",
            "note": null
          },
          {
            "field": "photoUrls",
            "type": "any",
            "note": null
          },
          {
            "field": "compositeUrl",
            "type": "any",
            "note": null
          },
          {
            "field": "expiresAt",
            "type": "any",
            "note": null
          },
          {
            "field": "event",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 404,
        "message": null,
        "code": null
      },
      {
        "status": 410,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "PhotoShare"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Sharing",
    "method": "POST",
    "path": "/api/share/deliver/:token",
    "own": "/deliver/:token",
    "mounted": true,
    "file": "photoShareRoutes.js",
    "line": 153,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "POST /api/share/deliver/:token (Public - Triggers delivery or tracks shares)",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "token",
          "note": "Path parameter from /api/share/deliver/:token."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "success",
            "type": "any",
            "note": null
          },
          {
            "field": "message",
            "type": "string",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 404,
        "message": null,
        "code": null
      },
      {
        "status": 403,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "PhotoShare"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Settings",
    "method": "GET",
    "path": "/api/settings/public",
    "own": "/public",
    "mounted": true,
    "file": "settingRoutes.js",
    "line": 48,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": true,
    "auth": false,
    "section": null,
    "purpose": "PUBLIC: Booth app fetches settings on startup GET /api/settings/public If x-device-token is present → returns org-specific settings If no token → returns global defaults (backward compat)",
    "derived": false,
    "request": {
      "body": [],
      "query": [
        {
          "field": "eventId",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "…",
            "type": "unknown",
            "note": "Additional keys spread from another object."
          },
          {
            "field": "settingObj",
            "type": "any",
            "note": null
          },
          {
            "field": "booth",
            "type": "any",
            "note": null
          },
          {
            "field": "gallery",
            "type": "any",
            "note": null
          },
          {
            "field": "organizationId",
            "type": "string",
            "note": null
          },
          {
            "field": "organizationName",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "Event",
      "Organization",
      "OrganizationDefaults"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Support",
    "method": "POST",
    "path": "/api/support",
    "own": "/",
    "mounted": true,
    "file": "supportRoutes.js",
    "line": 25,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": true,
    "auth": false,
    "section": null,
    "purpose": "PUBLIC: Submit an end-user ticket (from booth app) POST /api/support Uses optional device auth to auto-assign organizationId ticketType defaults to 'end_user' — routed to client_admin",
    "derived": false,
    "request": {
      "body": [
        {
          "field": "organizationId",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "trim",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 201,
        "fields": [
          {
            "field": "message",
            "type": "string",
            "note": null
          },
          {
            "field": "ticketId",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      201
    ],
    "errors": [
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 201,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [],
    "tools": []
  },
  {
    "backend": "main",
    "group": "Usage access",
    "method": "GET",
    "path": "/api/usage-access/role-defaults",
    "own": "/role-defaults",
    "mounted": true,
    "file": "usageAccessRoutes.js",
    "line": 33,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "─── ROLE DEFAULTS ──────────────────────────────────────────────────────── GET all role defaults",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [],
    "statuses": [],
    "errors": [
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "RoleConfig"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Usage access",
    "method": "PUT",
    "path": "/api/usage-access/role-defaults/:role",
    "own": "/role-defaults/:role",
    "mounted": true,
    "file": "usageAccessRoutes.js",
    "line": 43,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": true,
    "section": null,
    "purpose": "PUT update role defaults",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "role",
          "note": "Path parameter from /api/usage-access/role-defaults/:role."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "success",
            "type": "boolean",
            "note": null
          },
          {
            "field": "roleConfig",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "RoleConfig"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Usage access",
    "method": "GET",
    "path": "/api/usage-access/users",
    "own": "/users",
    "mounted": true,
    "file": "usageAccessRoutes.js",
    "line": 66,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "─── USER MANAGEMENT (RBAC) ─────────────────────────────────────────────── GET all users (Owner sees all, Client Admin sees only their org users)",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [],
    "statuses": [],
    "errors": [
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "User"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Usage access",
    "method": "POST",
    "path": "/api/usage-access/users",
    "own": "/users",
    "mounted": true,
    "file": "usageAccessRoutes.js",
    "line": 81,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "POST create user with permissions",
    "derived": false,
    "request": {
      "body": [
        {
          "field": "organizationId",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "toLowerCase",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 201,
        "fields": [
          {
            "field": "success",
            "type": "boolean",
            "note": null
          },
          {
            "field": "user",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      201
    ],
    "errors": [
      {
        "status": 403,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "User"
    ],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "main",
    "group": "Usage access",
    "method": "PUT",
    "path": "/api/usage-access/users/:id",
    "own": "/users/:id",
    "mounted": true,
    "file": "usageAccessRoutes.js",
    "line": 118,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "PUT update user permissions",
    "derived": false,
    "request": {
      "body": [
        {
          "field": "toLowerCase",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "trim",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/usage-access/users/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "success",
            "type": "boolean",
            "note": null
          },
          {
            "field": "user",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 404,
        "message": null,
        "code": null
      },
      {
        "status": 403,
        "message": null,
        "code": null
      },
      {
        "status": 403,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "User"
    ],
    "tools": []
  },
  {
    "backend": "main",
    "group": "Usage access",
    "method": "DELETE",
    "path": "/api/usage-access/users/:id",
    "own": "/users/:id",
    "mounted": true,
    "file": "usageAccessRoutes.js",
    "line": 157,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "DELETE a user",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/usage-access/users/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "success",
            "type": "boolean",
            "note": null
          },
          {
            "field": "message",
            "type": "string",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [
      {
        "status": 404,
        "message": null,
        "code": null
      },
      {
        "status": 403,
        "message": null,
        "code": null
      },
      {
        "status": 400,
        "message": null,
        "code": null
      },
      {
        "status": 500,
        "message": null,
        "code": null
      }
    ],
    "models": [
      "User"
    ],
    "tools": []
  },
  {
    "backend": "website",
    "group": "Website · public",
    "method": "GET",
    "path": "/api/health",
    "own": "/health",
    "mounted": true,
    "file": "website-backend/src/routes.js",
    "line": 130,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "─── Health + plans ──────────────────────────────────────────",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [],
    "statuses": [],
    "errors": [],
    "models": [],
    "tools": []
  },
  {
    "backend": "website",
    "group": "Website · public",
    "method": "GET",
    "path": "/api/plans",
    "own": "/plans",
    "mounted": true,
    "file": "website-backend/src/routes.js",
    "line": 132,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "Reads plans. Public.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "plans",
            "type": "array",
            "note": null
          },
          {
            "field": "addons",
            "type": "array",
            "note": null
          },
          {
            "field": "currency",
            "type": "string",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [],
    "tools": [
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "website",
    "group": "Website · public",
    "method": "POST",
    "path": "/api/checkout/order",
    "own": "/checkout/order",
    "mounted": true,
    "file": "website-backend/src/routes.js",
    "line": 154,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "─── Checkout: register-or-verify, then pay ────────────────── One form, two account paths (per product requirement): • email is NEW → we register the account (after payment verifies) • email EXISTS → the supplied password must match the existing account; then this purchase renews/upgrades that organization",
    "derived": false,
    "request": {
      "body": [
        {
          "field": "organizationName",
          "type": "string",
          "required": true,
          "default": null,
          "note": null
        },
        {
          "field": "ownerName",
          "type": "string",
          "required": true,
          "default": null,
          "note": null
        },
        {
          "field": "phone",
          "type": "string",
          "required": true,
          "default": null,
          "note": null
        },
        {
          "field": "planKey",
          "type": "string",
          "required": true,
          "default": null,
          "note": null
        },
        {
          "field": "addonKeys",
          "type": "array",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "billingPeriod",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "email",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "name",
          "type": "any",
          "required": false,
          "default": null,
          "note": null
        },
        {
          "field": "password",
          "type": "string",
          "required": false,
          "default": null,
          "note": null
        }
      ],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "free",
            "type": "boolean",
            "note": null
          },
          {
            "field": "activated",
            "type": "boolean",
            "note": null
          },
          {
            "field": "invoiceNo",
            "type": "any",
            "note": null
          },
          {
            "field": "organization",
            "type": "any",
            "note": null
          },
          {
            "field": "plan",
            "type": "object",
            "note": null
          },
          {
            "field": "isExistingAccount",
            "type": "boolean",
            "note": null
          },
          {
            "field": "message",
            "type": "string",
            "note": null
          }
        ]
      },
      {
        "status": 200,
        "fields": [
          {
            "field": "free",
            "type": "boolean",
            "note": null
          },
          {
            "field": "orderId",
            "type": "any",
            "note": null
          },
          {
            "field": "amount",
            "type": "any",
            "note": null
          },
          {
            "field": "currency",
            "type": "any",
            "note": null
          },
          {
            "field": "keyId",
            "type": "any",
            "note": null
          },
          {
            "field": "plan",
            "type": "object",
            "note": null
          },
          {
            "field": "billingPeriod",
            "type": "any",
            "note": null
          },
          {
            "field": "addons",
            "type": "any",
            "note": null
          },
          {
            "field": "pricing",
            "type": "any",
            "note": null
          },
          {
            "field": "isExistingAccount",
            "type": "boolean",
            "note": null
          },
          {
            "field": "organizationName",
            "type": "any",
            "note": null
          },
          {
            "field": "prefill",
            "type": "object",
            "note": null
          },
          {
            "field": "description",
            "type": "string",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "Organization",
      "SubscriptionPlan",
      "User"
    ],
    "tools": [
      {
        "key": "razorpay",
        "name": "Razorpay",
        "kind": "payments",
        "note": "Order creation and signature verification."
      },
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "website",
    "group": "Website · public",
    "method": "POST",
    "path": "/api/checkout/verify",
    "own": "/checkout/verify",
    "mounted": true,
    "file": "website-backend/src/routes.js",
    "line": 389,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "Creates checkout verify. Public.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "activated",
            "type": "boolean",
            "note": null
          },
          {
            "field": "invoiceNo",
            "type": "any",
            "note": null
          },
          {
            "field": "organization",
            "type": "any",
            "note": null
          },
          {
            "field": "plan",
            "type": "any",
            "note": null
          },
          {
            "field": "isExistingAccount",
            "type": "boolean",
            "note": null
          },
          {
            "field": "message",
            "type": "string",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "SubscriptionPlan"
    ],
    "tools": [
      {
        "key": "razorpay",
        "name": "Razorpay",
        "kind": "payments",
        "note": "Order creation and signature verification."
      },
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "website",
    "group": "Website · public",
    "method": "GET",
    "path": "/api/downloads/:id",
    "own": "/downloads/:id",
    "mounted": true,
    "file": "website-backend/src/routes.js",
    "line": 451,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "Reads downloads. Public.",
    "derived": true,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/downloads/:id."
        }
      ]
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "downloadId",
            "type": "string",
            "note": null
          },
          {
            "field": "compositeUrl",
            "type": "string",
            "note": null
          },
          {
            "field": "photoUrls",
            "type": "array",
            "note": null
          },
          {
            "field": "eventName",
            "type": "string",
            "note": null
          },
          {
            "field": "organizationName",
            "type": "string",
            "note": null
          },
          {
            "field": "createdAt",
            "type": "any",
            "note": null
          },
          {
            "field": "expiresAt",
            "type": "any",
            "note": null
          },
          {
            "field": "remainingMs",
            "type": "any",
            "note": null
          },
          {
            "field": "downloadCount",
            "type": "number",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "GuestDownload"
    ],
    "tools": [
      {
        "key": "cloudinary",
        "name": "Cloudinary",
        "kind": "media",
        "note": "Image upload, transformation and signed delivery."
      },
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "website",
    "group": "Website · public",
    "method": "GET",
    "path": "/api/downloads/:id/file/:kind",
    "own": "/downloads/:id/file/:kind",
    "mounted": true,
    "file": "website-backend/src/routes.js",
    "line": 501,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "kind = 'composite' or a 0-based photo index. Redirects to a signed attachment URL (or streams data: URLs directly).",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": [
        {
          "field": "id",
          "note": "Path parameter from /api/downloads/:id/file/:kind."
        },
        {
          "field": "kind",
          "note": "Path parameter from /api/downloads/:id/file/:kind."
        }
      ]
    },
    "responses": [],
    "statuses": [],
    "errors": [],
    "models": [
      "GuestDownload"
    ],
    "tools": [
      {
        "key": "cloudinary",
        "name": "Cloudinary",
        "kind": "media",
        "note": "Image upload, transformation and signed delivery."
      },
      {
        "key": "mongo",
        "name": "MongoDB Atlas",
        "kind": "data",
        "note": "Operational persistence."
      }
    ]
  },
  {
    "backend": "website",
    "group": "Website · public",
    "method": "POST",
    "path": "/api/internal/downloads",
    "own": "/internal/downloads",
    "mounted": true,
    "file": "website-backend/src/routes.js",
    "line": 559,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "─── Internal: mint a download (booth / other HappyPix services) ── The main backend already mints these on session completion; this is for other producers. Requires the shared internal secret — never expose it to a browser.",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "downloadId",
            "type": "any",
            "note": null
          },
          {
            "field": "url",
            "type": "string",
            "note": null
          },
          {
            "field": "expiresAt",
            "type": "any",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "GuestDownload"
    ],
    "tools": []
  },
  {
    "backend": "website",
    "group": "Website · public",
    "method": "POST",
    "path": "/api/leads",
    "own": "/leads",
    "mounted": true,
    "file": "website-backend/src/routes.js",
    "line": 587,
    "permission": null,
    "writableOrg": false,
    "deviceAuth": false,
    "auth": false,
    "section": null,
    "purpose": "─── Leads ───────────────────────────────────────────────────",
    "derived": false,
    "request": {
      "body": [],
      "query": [],
      "params": []
    },
    "responses": [
      {
        "status": 200,
        "fields": [
          {
            "field": "received",
            "type": "boolean",
            "note": null
          },
          {
            "field": "id",
            "type": "string",
            "note": null
          },
          {
            "field": "message",
            "type": "string",
            "note": null
          }
        ]
      }
    ],
    "statuses": [
      200
    ],
    "errors": [],
    "models": [
      "WebsiteLead"
    ],
    "tools": []
  }
];

export const ATLAS_MODELS = [
  {
    "name": "AuditLog",
    "file": "AuditLog.js",
    "collection": "auditlogs",
    "summary": "Legacy field names kept readable for older callers (details/ipAddress/",
    "fields": [
      {
        "field": "actorId",
        "type": "ObjectId",
        "ref": "User",
        "required": false,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "actorName",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "'System'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "actorRole",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "'SYSTEM'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "organizationId",
        "type": "ObjectId",
        "ref": "Organization",
        "required": false,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "action",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "entity",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "summary",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "severity",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "info",
          "warn",
          "danger"
        ],
        "default": "'info'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "ip",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "at",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "_id",
        "type": "ObjectId",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      }
    ],
    "refs": [
      "Organization",
      "User"
    ],
    "indexedFields": 3,
    "fieldCount": 11
  },
  {
    "name": "Coupon",
    "file": "Coupon.js",
    "collection": "coupons",
    "summary": "Compound unique index so codes are unique per organization",
    "fields": [
      {
        "field": "organizationId",
        "type": "ObjectId",
        "ref": "Organization",
        "required": true,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "code",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "type",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": [
          "percentage",
          "fixed"
        ],
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "value",
        "type": "Number",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "quantity",
        "type": "Number",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "usedCount",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "expiryDate",
        "type": "Date",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "eventIds",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "status",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "active",
          "paused"
        ],
        "default": "'active'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "_id",
        "type": "ObjectId",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "updatedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      }
    ],
    "refs": [
      "Organization"
    ],
    "indexedFields": 1,
    "fieldCount": 12
  },
  {
    "name": "DeliveryRecord",
    "file": "DeliveryRecord.js",
    "collection": "deliveryrecords",
    "summary": "13 fields, referencing Event, Organization, PhotoShare.",
    "fields": [
      {
        "field": "photoShareId",
        "type": "ObjectId",
        "ref": "PhotoShare",
        "required": true,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "eventId",
        "type": "ObjectId",
        "ref": "Event",
        "required": true,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "organizationId",
        "type": "ObjectId",
        "ref": "Organization",
        "required": true,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "method",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": [
          "QR",
          "DOWNLOAD",
          "WHATSAPP",
          "EMAIL",
          "SMS",
          "NATIVE_SHARE",
          "COPY_LINK"
        ],
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "destinationMasked",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "status",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "pending",
          "sent",
          "failed"
        ],
        "default": "'pending'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "provider",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "providerMessageId",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "errorCode",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "sentAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "failedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "_id",
        "type": "ObjectId",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      }
    ],
    "refs": [
      "Event",
      "Organization",
      "PhotoShare"
    ],
    "indexedFields": 3,
    "fieldCount": 13
  },
  {
    "name": "Device",
    "file": "Device.js",
    "collection": "devices",
    "summary": "─── Indexes ─────────────────────────────────────────────────",
    "fields": [
      {
        "field": "organizationId",
        "type": "ObjectId",
        "ref": "Organization",
        "required": true,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "deviceUuid",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": true,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "deviceName",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "location",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "deviceTokenHash",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "operatorName",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "operatorPhone",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "assignedEventId",
        "type": "ObjectId",
        "ref": "Event",
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "lastSeenAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "ipAddress",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "userAgent",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "platform",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "appVersion",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "telemetry.prints",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "telemetry.shutters",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "telemetry.printBaseline",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "telemetry.shutterBaseline",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "telemetry.counterResetAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "telemetry.batteryPct",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "100",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "telemetry.printerModel",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "telemetry.printerStatus",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "telemetry.paperRemaining",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "telemetry.cameraModel",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "telemetry.updatedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "connections.camera",
        "type": "Boolean",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "false",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "connections.printer",
        "type": "Boolean",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "false",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "connections.kioskScreen",
        "type": "Boolean",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "false",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "connections.updatedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "status",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "active",
          "inactive",
          "blocked"
        ],
        "default": "'active'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "_id",
        "type": "ObjectId",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "updatedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      }
    ],
    "refs": [
      "Event",
      "Organization"
    ],
    "indexedFields": 3,
    "fieldCount": 32
  },
  {
    "name": "DigitalToken",
    "file": "DigitalToken.js",
    "collection": "digitaltokens",
    "summary": "8 fields, referencing Payment.",
    "fields": [
      {
        "field": "token",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": true,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "paymentId",
        "type": "ObjectId",
        "ref": "Payment",
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "photoUrls",
        "type": "[Mixed]",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "compositeUrl",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "expiresAt",
        "type": "Date",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "downloadCount",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "_id",
        "type": "ObjectId",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      }
    ],
    "refs": [
      "Payment"
    ],
    "indexedFields": 2,
    "fieldCount": 8
  },
  {
    "name": "Event",
    "file": "Event.js",
    "collection": "events",
    "summary": "49 fields, referencing Organization, User.",
    "fields": [
      {
        "field": "organizationId",
        "type": "ObjectId",
        "ref": "Organization",
        "required": false,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "name",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "clientName",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "location",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "startDate",
        "type": "Date",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "endDate",
        "type": "Date",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "status",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "upcoming",
          "live",
          "finished"
        ],
        "default": "'upcoming'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "paused",
        "type": "Boolean",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "false",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "templateIds",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "filters",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "digitalCopy",
        "type": "Boolean",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "true",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "layoutPrices",
        "type": "Mixed",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "branding.logoUrl",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "branding.tagline",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "branding.logos",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "shortCode",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "assignedDeviceIds",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "passkey",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "printPrice",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "allowedTemplates",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "allowedFilters",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "printOptions",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "[1,2]",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "downloadEnabled",
        "type": "Boolean",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "true",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "printingEnabled",
        "type": "Boolean",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "true",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "boothTimeout",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "60",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "qrTimeoutMinutes",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "5",
        "min": 1,
        "max": 30,
        "note": ""
      },
      {
        "field": "razorpayKeyId",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "razorpayKeySecret",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "cashfreeAppId",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "cashfreeSecretKey",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "cashfreeEnv",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "sandbox",
          "production"
        ],
        "default": "'production'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "gatewayPriority",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "razorpay",
          "cashfree"
        ],
        "default": "'razorpay'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "upiId",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "qrCodeUrl",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "gridPrices",
        "type": "Mixed",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "formatPrices",
        "type": "Mixed",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "overrideTemplatePrices",
        "type": "Boolean",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "false",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "templatePrices",
        "type": "Mixed",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "selectedScreens",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "[\"capture\",\"filter\",\"preview\",\"payment\",",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "sharingConfig",
        "type": "Mixed",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "selectedFrameUrls",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "enabledLayouts",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "[]",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "organizerName",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "allowPrint",
        "type": "Boolean",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "true",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "assignedManagerId",
        "type": "ObjectId",
        "ref": "User",
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdBy",
        "type": "ObjectId",
        "ref": "User",
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "_id",
        "type": "ObjectId",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "updatedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      }
    ],
    "refs": [
      "Organization",
      "User"
    ],
    "indexedFields": 1,
    "fieldCount": 49
  },
  {
    "name": "GuestDownload",
    "file": "GuestDownload.js",
    "collection": "guestdownloads",
    "summary": "============================================================",
    "fields": [
      {
        "field": "downloadId",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": true,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "organizationId",
        "type": "ObjectId",
        "ref": "Organization",
        "required": false,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "eventId",
        "type": "ObjectId",
        "ref": "Event",
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "deviceId",
        "type": "ObjectId",
        "ref": "Device",
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "sessionId",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "payloadFingerprint",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "compositeUrl",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "photoUrls",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "[]",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "photoIds",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "eventName",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "organizationName",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "expiresAt",
        "type": "Date",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "viewCount",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "downloadCount",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "_id",
        "type": "ObjectId",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      }
    ],
    "refs": [
      "Device",
      "Event",
      "Organization"
    ],
    "indexedFields": 4,
    "fieldCount": 16
  },
  {
    "name": "OrgAiTemplate",
    "file": "OrgAiTemplate.js",
    "collection": "orgaitemplates",
    "summary": "28 fields, referencing Organization, User.",
    "fields": [
      {
        "field": "organizationId",
        "type": "ObjectId",
        "ref": "Organization",
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "name",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "category",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "'Custom'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "description",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "price",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": 0,
        "max": null,
        "note": ""
      },
      {
        "field": "layout.code",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "layout.id",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "layout.name",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "layout.familyId",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "layout.width",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "layout.height",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "layout.orientation",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "layout.slotCount",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "layout.slots",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "layout.sheets",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "layout.cutout",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "layout.printSize",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "slots",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "[]",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "design",
        "type": "Mixed",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "assets",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "[]",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "versions",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "[]",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "prompt",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "source",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "'ai'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "cache.indexedDb",
        "type": "Boolean",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "true",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdBy",
        "type": "ObjectId",
        "ref": "User",
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "_id",
        "type": "ObjectId",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "updatedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      }
    ],
    "refs": [
      "Organization",
      "User"
    ],
    "indexedFields": 0,
    "fieldCount": 28
  },
  {
    "name": "Organization",
    "file": "Organization.js",
    "collection": "organizations",
    "summary": "Plan limits map — enforced at device creation",
    "fields": [
      {
        "field": "name",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "ownerName",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "email",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": true,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "phone",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "country",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "'IN'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "plan",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "'trial'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "currency",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "AUD",
          "INR"
        ],
        "default": "'INR'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "billingCycle",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "monthly",
          "quarterly",
          "semiannual",
          "annual"
        ],
        "default": "'monthly'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "planStartedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "planExpiresAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "nextBillingDate",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "paymentGateway",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "razorpay",
          "stripe"
        ],
        "default": "'razorpay'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "status",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "active",
          "suspended",
          "banned",
          "expired"
        ],
        "default": "'active'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "suspendReason",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "suspendedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "suspendedBy",
        "type": "ObjectId",
        "ref": "User",
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "trialEndsAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "trialExtensionCount",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "trialExtendedUntil",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "allowedDevices",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "1",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "addons",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "[]",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "aiCredits",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "allowedEvents",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "1",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "sessionVersion",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "gallerySettings.galleryEnabled",
        "type": "Boolean",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "gallerySettings.requireGuestConsent",
        "type": "Boolean",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "internalNotes",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdBy",
        "type": "ObjectId",
        "ref": "User",
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "_id",
        "type": "ObjectId",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "updatedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      }
    ],
    "refs": [
      "User"
    ],
    "indexedFields": 1,
    "fieldCount": 31
  },
  {
    "name": "OrganizationDefaults",
    "file": "OrganizationDefaults.js",
    "collection": "organizationdefaults",
    "summary": "20 fields, referencing Organization.",
    "fields": [
      {
        "field": "organizationId",
        "type": "ObjectId",
        "ref": "Organization",
        "required": true,
        "unique": true,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "name",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "logoUrl",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "boothTimeoutSec",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "60",
        "min": 10,
        "max": 86400,
        "note": ""
      },
      {
        "field": "qrTimeoutMinutes",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "5",
        "min": 1,
        "max": 30,
        "note": ""
      },
      {
        "field": "upiId",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "payoutMode",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "upi",
          "wallet"
        ],
        "default": "'wallet'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "paymentDisplayName",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "razorpayKeyId",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "razorpayKeySecret",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "razorpayEnv",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "sandbox",
          "production"
        ],
        "default": "'production'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "cashfreeAppId",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "cashfreeSecretKey",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "cashfreeEnv",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "sandbox",
          "production"
        ],
        "default": "'production'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "gatewayPriority",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "razorpay",
          "cashfree"
        ],
        "default": "'razorpay'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "layoutPrices",
        "type": "Mixed",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "templatePrices",
        "type": "Mixed",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "_id",
        "type": "ObjectId",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "updatedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      }
    ],
    "refs": [
      "Organization"
    ],
    "indexedFields": 1,
    "fieldCount": 20
  },
  {
    "name": "Payment",
    "file": "Payment.js",
    "collection": "payments",
    "summary": "30 fields, referencing Device, Event, Organization.",
    "fields": [
      {
        "field": "organizationId",
        "type": "ObjectId",
        "ref": "Organization",
        "required": false,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "razorpayOrderId",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "paymentLinkId",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "paymentLinkUrl",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "razorpayPaymentId",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "razorpaySignature",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "gateway",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "razorpay",
          "cashfree"
        ],
        "default": "'razorpay'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "cashfreeOrderId",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "cashfreePaymentId",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "cashfreeQrData",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "eventId",
        "type": "ObjectId",
        "ref": "Event",
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "eventName",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "deviceId",
        "type": "ObjectId",
        "ref": "Device",
        "required": false,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "sessionId",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "guestPhone",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "settlement",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "upi",
          "wallet"
        ],
        "default": "'wallet'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "amount",
        "type": "Number",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "currency",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "'INR'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "printCount",
        "type": "Number",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "digitalCopy",
        "type": "Boolean",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "false",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "photoUrls",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "[]",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "compositeUrl",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "couponCode",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "couponCounted",
        "type": "Boolean",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "false",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "discountApplied",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "status",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "created",
          "pending",
          "paid",
          "failed"
        ],
        "default": "'pending'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "utr",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "paidAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "_id",
        "type": "ObjectId",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      }
    ],
    "refs": [
      "Device",
      "Event",
      "Organization"
    ],
    "indexedFields": 4,
    "fieldCount": 30
  },
  {
    "name": "Photo",
    "file": "Photo.js",
    "collection": "photos",
    "summary": "15 fields, referencing Device, Event, Organization.",
    "fields": [
      {
        "field": "organizationId",
        "type": "ObjectId",
        "ref": "Organization",
        "required": false,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "s3Key",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "url",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "compositeUrl",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "eventId",
        "type": "ObjectId",
        "ref": "Event",
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "deviceId",
        "type": "ObjectId",
        "ref": "Device",
        "required": false,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "sessionId",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "payloadFingerprint",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "guestConsent",
        "type": "Boolean",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "false",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "generatedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "finalised",
        "type": "Boolean",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "false",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "printStatus",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "'printed'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "digitalStatus",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "'delivered'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "_id",
        "type": "ObjectId",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      }
    ],
    "refs": [
      "Device",
      "Event",
      "Organization"
    ],
    "indexedFields": 4,
    "fieldCount": 15
  },
  {
    "name": "PhotoShare",
    "file": "PhotoShare.js",
    "collection": "photoshares",
    "summary": "13 fields, referencing Event, Organization.",
    "fields": [
      {
        "field": "eventId",
        "type": "ObjectId",
        "ref": "Event",
        "required": true,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "organizationId",
        "type": "ObjectId",
        "ref": "Organization",
        "required": false,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "tokenHash",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": true,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "photoUrls",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "[]",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "compositeUrl",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "photoIds",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "expiresAt",
        "type": "Date",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "status",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "active",
          "expired",
          "disabled"
        ],
        "default": "'active'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "viewCount",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "downloadCount",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "shareCount",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "_id",
        "type": "ObjectId",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      }
    ],
    "refs": [
      "Event",
      "Organization"
    ],
    "indexedFields": 4,
    "fieldCount": 13
  },
  {
    "name": "PlatformSupportRequest",
    "file": "PlatformSupportRequest.js",
    "collection": "platformsupportrequests",
    "summary": "23 fields, referencing Organization, User.",
    "fields": [
      {
        "field": "ticketNo",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": true,
        "indexed": true,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "organizationId",
        "type": "ObjectId",
        "ref": "Organization",
        "required": true,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdBy",
        "type": "ObjectId",
        "ref": "User",
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "subject",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "category",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "technical",
          "billing",
          "account",
          "feature",
          "other"
        ],
        "default": "'other'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "priority",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "low",
          "medium",
          "high",
          "urgent"
        ],
        "default": "'medium'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "status",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "new",
          "denied",
          "open",
          "in_progress",
          "resolved"
        ],
        "default": "'new'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "decision.type",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "accepted",
          "denied"
        ],
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "decision.reason",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "decision.by",
        "type": "ObjectId",
        "ref": "User",
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "decision.at",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "messages",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "reapplyCount",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "lastReapplication.text",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "lastReapplication.images",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "lastReapplication.authorId",
        "type": "ObjectId",
        "ref": "User",
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "lastReapplication.at",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "resolution",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "acceptedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "resolvedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "_id",
        "type": "ObjectId",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "updatedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      }
    ],
    "refs": [
      "Organization",
      "User"
    ],
    "indexedFields": 2,
    "fieldCount": 23
  },
  {
    "name": "RoleConfig",
    "file": "RoleConfig.js",
    "collection": "roleconfigs",
    "summary": "4 fields.",
    "fields": [
      {
        "field": "role",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": true,
        "indexed": true,
        "enum": [
          "ADMIN",
          "MANAGER",
          "CLIENT_ADMIN",
          "CLIENT_MANAGER",
          "BOOTH_OPERATOR"
        ],
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "permissions",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "updatedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "_id",
        "type": "ObjectId",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      }
    ],
    "refs": [],
    "indexedFields": 1,
    "fieldCount": 4
  },
  {
    "name": "Setting",
    "file": "Setting.js",
    "collection": "settings",
    "summary": "Unique per org (one settings doc per org)",
    "fields": [
      {
        "field": "organizationId",
        "type": "ObjectId",
        "ref": "Organization",
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "enableMobilePrinting",
        "type": "Boolean",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "true",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "galleryEnabled",
        "type": "Boolean",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "true",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "requireGuestConsent",
        "type": "Boolean",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "false",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "galleryUpdatedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "galleryUpdatedBy",
        "type": "ObjectId",
        "ref": "User",
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "razorpayKeyId",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "razorpayKeySecret",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "cashfreeAppId",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "cashfreeSecretKey",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "cashfreeEnv",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "sandbox",
          "production"
        ],
        "default": "'production'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "gatewayPriority",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "razorpay",
          "cashfree"
        ],
        "default": "'razorpay'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "upiId",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "upiName",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "upiQrImageUrl",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "updatedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "_id",
        "type": "ObjectId",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      }
    ],
    "refs": [
      "Organization",
      "User"
    ],
    "indexedFields": 0,
    "fieldCount": 17
  },
  {
    "name": "Subscription",
    "file": "Subscription.js",
    "collection": "subscriptions",
    "summary": "19 fields, referencing Organization, User.",
    "fields": [
      {
        "field": "organizationId",
        "type": "ObjectId",
        "ref": "Organization",
        "required": true,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "plan",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "amount",
        "type": "Number",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "originalAmount",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "discountAmount",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "discountType",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "none",
          "percent",
          "flat"
        ],
        "default": "'none'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "discountValue",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "discountLabel",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "razorpayOrderId",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "razorpayPaymentId",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "razorpaySignature",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "invoiceNo",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": true,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "startDate",
        "type": "Date",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "endDate",
        "type": "Date",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "status",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "paid",
          "pending",
          "failed"
        ],
        "default": "'paid'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdBy",
        "type": "ObjectId",
        "ref": "User",
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "_id",
        "type": "ObjectId",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "updatedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      }
    ],
    "refs": [
      "Organization",
      "User"
    ],
    "indexedFields": 2,
    "fieldCount": 19
  },
  {
    "name": "SubscriptionPlan",
    "file": "SubscriptionPlan.js",
    "collection": "subscriptionplans",
    "summary": "27 fields.",
    "fields": [
      {
        "field": "key",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": true,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "name",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "description",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "price",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "discountType",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "none",
          "percent",
          "flat"
        ],
        "default": "'none'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "discountValue",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "discountLabel",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "discountStartsAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "discountEndsAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "discountMaxRedemptions",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "discountRedemptions",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "durationMonths",
        "type": "Number",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "durationLabel",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "devices",
        "type": "Number",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "events",
        "type": "Number",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "active",
        "type": "Boolean",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "true",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "isDeleted",
        "type": "Boolean",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": "false",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "kind",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": true,
        "enum": [
          "plan",
          "addon"
        ],
        "default": "'plan'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "priceMonthly",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "priceQuarterly",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "priceSemiannual",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "priceAnnual",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "billingNote",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "aiCredits",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "_id",
        "type": "ObjectId",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "updatedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      }
    ],
    "refs": [],
    "indexedFields": 3,
    "fieldCount": 27
  },
  {
    "name": "SupportTicket",
    "file": "SupportTicket.js",
    "collection": "supporttickets",
    "summary": "─── Ticket Types ─────────────────────────────────────────────",
    "fields": [
      {
        "field": "ticketType",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "end_user",
          "client"
        ],
        "default": "'end_user'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "organizationId",
        "type": "ObjectId",
        "ref": "Organization",
        "required": false,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "name",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "email",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "subject",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "message",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "eventId",
        "type": "ObjectId",
        "ref": "Event",
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "eventShortCode",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "deviceId",
        "type": "ObjectId",
        "ref": "Device",
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "sessionId",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "paymentReference",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "holdPhotos",
        "type": "Boolean",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "false",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "status",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "open",
          "in-progress",
          "resolved",
          "closed"
        ],
        "default": "'open'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "priority",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "low",
          "normal",
          "high",
          "urgent"
        ],
        "default": "'normal'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "resolvedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "adminNotes",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "_id",
        "type": "ObjectId",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "updatedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      }
    ],
    "refs": [
      "Device",
      "Event",
      "Organization"
    ],
    "indexedFields": 1,
    "fieldCount": 19
  },
  {
    "name": "Template",
    "file": "Template.js",
    "collection": "templates",
    "summary": "The new v2 Template is global/platform-owned.",
    "fields": [
      {
        "field": "name",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "description",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "category",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "'Custom'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "price",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": 0,
        "max": null,
        "note": ""
      },
      {
        "field": "layoutId",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "componentId",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "design",
        "type": "Mixed",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "source",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": [
          "designer",
          "playground",
          "ai_generated"
        ],
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "active",
        "type": "Boolean",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "true",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "usage",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdBy",
        "type": "ObjectId",
        "ref": "User",
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "_id",
        "type": "ObjectId",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "updatedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      }
    ],
    "refs": [
      "User"
    ],
    "indexedFields": 0,
    "fieldCount": 14
  },
  {
    "name": "TemplateLayout",
    "file": "TemplateLayout.js",
    "collection": "templatelayouts",
    "summary": "6 fields, referencing User.",
    "fields": [
      {
        "field": "codeword",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": true,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "grid",
        "type": "Mixed",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdBy",
        "type": "ObjectId",
        "ref": "User",
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "_id",
        "type": "ObjectId",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "updatedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      }
    ],
    "refs": [
      "User"
    ],
    "indexedFields": 1,
    "fieldCount": 6
  },
  {
    "name": "Ticket",
    "file": "Ticket.js",
    "collection": "tickets",
    "summary": "15 fields, referencing Device, Event, Organization.",
    "fields": [
      {
        "field": "organizationId",
        "type": "ObjectId",
        "ref": "Organization",
        "required": true,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "eventId",
        "type": "ObjectId",
        "ref": "Event",
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "deviceId",
        "type": "ObjectId",
        "ref": "Device",
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "category",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "device",
          "payment",
          "photo",
          "event",
          "general"
        ],
        "default": "'general'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "subject",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "priority",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "low",
          "medium",
          "high",
          "urgent"
        ],
        "default": "'medium'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "status",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "open",
          "in_progress",
          "resolved",
          "closed"
        ],
        "default": "'open'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "guest.name",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "guest.contact",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "session",
        "type": "Mixed",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "messages",
        "type": "[Mixed]",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "resolution",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "_id",
        "type": "ObjectId",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "updatedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      }
    ],
    "refs": [
      "Device",
      "Event",
      "Organization"
    ],
    "indexedFields": 1,
    "fieldCount": 15
  },
  {
    "name": "User",
    "file": "User.js",
    "collection": "users",
    "summary": "Validate Organization ID constraints based on role",
    "fields": [
      {
        "field": "name",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "email",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": true,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "password",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "phoneNumber",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "profilePhotoUrl",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "role",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": [
          "OWNER",
          "PLATFORM_ADMIN",
          "SUPPORT_MANAGER",
          "ORG_ADMIN",
          "ORG_MANAGER"
        ],
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "status",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "active",
          "inactive"
        ],
        "default": "'active'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "organizationId",
        "type": "ObjectId",
        "ref": "Organization",
        "required": false,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "lastLoginAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "sessionVersion",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "forgotPasswordCodeHash",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "forgotPasswordCodeExpires",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "forgotPasswordAttempts",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "emailChangeCodeHash",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "emailChangeCodeExpires",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "emailChangePending",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "emailChangeAttempts",
        "type": "Number",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "0",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "_id",
        "type": "ObjectId",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      }
    ],
    "refs": [
      "Organization"
    ],
    "indexedFields": 2,
    "fieldCount": 19
  },
  {
    "name": "WebsiteLead",
    "file": "WebsiteLead.js",
    "collection": "websiteleads",
    "summary": "13 fields.",
    "fields": [
      {
        "field": "name",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "email",
        "type": "String",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "phone",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "company",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "message",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "type",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": true,
        "enum": [
          "contact",
          "demo",
          "hardware",
          "support"
        ],
        "default": "'contact'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "status",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": true,
        "enum": [
          "new",
          "contacted",
          "closed"
        ],
        "default": "'new'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "notes",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "''",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "contactedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "closedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "_id",
        "type": "ObjectId",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "updatedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      }
    ],
    "refs": [],
    "indexedFields": 3,
    "fieldCount": 13
  },
  {
    "name": "Withdrawal",
    "file": "Withdrawal.js",
    "collection": "withdrawals",
    "summary": "12 fields, referencing Organization, User.",
    "fields": [
      {
        "field": "organizationId",
        "type": "ObjectId",
        "ref": "Organization",
        "required": true,
        "unique": false,
        "indexed": true,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "amount",
        "type": "Number",
        "ref": null,
        "required": true,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": 1,
        "max": null,
        "note": ""
      },
      {
        "field": "status",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": [
          "processing",
          "paid",
          "failed"
        ],
        "default": "'processing'",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "upiId",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "reference",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "requestedBy",
        "type": "ObjectId",
        "ref": "User",
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "requestedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "processedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "note",
        "type": "String",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": "null",
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "_id",
        "type": "ObjectId",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "createdAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      },
      {
        "field": "updatedAt",
        "type": "Date",
        "ref": null,
        "required": false,
        "unique": false,
        "indexed": false,
        "enum": null,
        "default": null,
        "min": null,
        "max": null,
        "note": ""
      }
    ],
    "refs": [
      "Organization",
      "User"
    ],
    "indexedFields": 1,
    "fieldCount": 12
  }
];

export const ATLAS_UNMAPPED_FILES = [];
