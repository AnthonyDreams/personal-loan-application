# API Documentation for Personal Loan Application

This API enables users to register, log in, request loans, view loan details, update loan status (admin only), and process payments. Except for the authentication endpoints, all endpoints require a valid JWT token (passed in the `Authorization` header as a bearer token).

## Authentication Endpoints

### Register

**Endpoint:**  
`POST {{base_url}}/auth/register`

**Request Body Example:**

```json
{
  "email": "asdass@ghmdail.com",
  "password": "123",
  "name": "A name"
}
```

**Successful Response:**

- **Status:** 201 Created
- **Body Example:**

  ```json
  {
    "message": "User registered successfully"
  }
  ```

**Possible Errors:**

- **400 Bad Request**: When required fields are missing or the payload is malformed.
- **400 Conflict**: When the email is already registered.

---

### Login

**Endpoint:**  
`POST {{base_url}}/auth/login`

**Request Body Example:**

```json
{
  "email": "asdass@ghmdail.com",
  "password": "123"
}
```

**Successful Response:**

- **Status:** 200 OK
- **Body Example:**

  ```json
  {
    "message": "User logged in successfully",
    "data": {
      "access_token": "token"
    }
  }
  ```

**Possible Errors:**

- **401 Unauthorized**: When the email or password is incorrect.

---

## Loan Endpoints

### Admin Update Loan Status

**Endpoint:**  
`PATCH {{base_url}}/admin/loans/{loanId}/status`

**Request Body Example:**

```json
{
  "status": "approved"
}
```

**Successful Response:**

- **Status:** 200 OK
- **Body Example:**

  ```json
  {
    "id": 21,
    "amount": 800.6,
    "purpose": "sala",
    "duration": 1,
    "status": "APPROVED",
    "total_paid": 0,
    "remaining_balance": 800.6,
    "created_at": "2025-02-23T05:54:34.973Z"
  }
  ```

**Possible Errors:**

- **400 Bad Request**: If an invalid status value is provided.
- **401 Unauthorized**: When the token is missing or invalid.
- **403 Forbidden**: If the user is not an admin.
- **404 Not Found**: When the loan with the specified ID does not exist.

---

### Request Loan

**Endpoint:**  
`POST {{base_url}}/loans/request`

**Request Body Example:**

```json
{
  "amount": 800.6,
  "purpose": "sala",
  "duration": 1
}
```

**Successful Response:**

- **Status:** 201 Created
- **Body Example:**

  ```json
  {
    "id": 35,
    "amount": 800.6,
    "duration": 1,
    "status": "PENDING",
    "remaining_balance": 800.6,
    "created_at": "2025-02-23T17:14:01.552Z"
  }
  ```

**Possible Errors:**

- **400 Bad Request**: If the request data is invalid.
- **401 Unauthorized**: When the token is missing or invalid.

---

### List Loans

**Endpoint:**  
`GET {{base_url}}/loans`

**Query Parameters:**

- **page** (optional, default: 1): The page number to retrieve.
- **per_page** (optional, default: 10): The number of items to display per page.

**Successful Response:**

- **Status:** 200 OK
- **Body Example:**

  ```json
  {
    "data": [
      {
        "id": 34,
        "amount": 800.6,
        "purpose": "sala",
        "duration": 1,
        "status": "PENDING",
        "total_paid": 0,
        "remaining_balance": 800.6,
        "created_at": "2025-02-23T17:13:53.880Z"
      },
      {
        "id": 35,
        "amount": 500000000,
        "purpose": "sala",
        "duration": 1,
        "status": "PENDING",
        "total_paid": 0,
        "remaining_balance": 500000000,
        "created_at": "2025-02-23T17:14:01.552Z"
      }
    ],
    "meta": {
      "total": 2,
      "lastPage": 1,
      "currentPage": 1,
      "perPage": 10,
      "prevPage": null,
      "nextPage": null
    }
  }
  ```

**Possible Errors:**

- **401 Unauthorized**: When the token is missing or invalid.

---

### Get Loan

**Endpoint:**  
`GET {{base_url}}/loans/{loanId}`

**Successful Response:**

- **Status:** 200 OK
- **Body Example:**

  ```json
  {
    "id": 34,
    "amount": 800.6,
    "purpose": "sala",
    "duration": 1,
    "status": "PENDING",
    "total_paid": 0,
    "remaining_balance": 800.6,
    "created_at": "2025-02-23T17:13:53.880Z"
  }
  ```

**Possible Errors:**

- **401 Unauthorized**: When the token is missing or invalid.
- **404 Not Found**: When the loan with the specified ID is not found.

---

### List Loan Payments

**Endpoint:**  
`GET {{base_url}}/loans/{loanId}/payments?page={pageNumber}`

**Query Parameters:**

- **page** (optional, default: 1): The page number to retrieve.
- **per_page** (optional, default: 10): The number of items to display per page.

**Successful Response:**

- **Status:** 200 OK
- **Body Example:**

  ```json
  {
    "data": [
      {
        "id": 9,
        "amount_paid": 200.5,
        "payment_date": "2025-02-23T05:54:52.326Z",
        "created_at": "2025-02-23T05:54:52.326Z"
      },
      {
        "id": 10,
        "amount_paid": 1,
        "payment_date": "2025-02-23T05:57:33.293Z",
        "created_at": "2025-02-23T05:57:33.293Z"
      },
      {
        "id": 11,
        "amount_paid": 1,
        "payment_date": "2025-02-23T05:57:33.965Z",
        "created_at": "2025-02-23T05:57:33.965Z"
      },
      {
        "id": 12,
        "amount_paid": 1,
        "payment_date": "2025-02-23T05:57:34.536Z",
        "created_at": "2025-02-23T05:57:34.536Z"
      },
      {
        "id": 13,
        "amount_paid": 1,
        "payment_date": "2025-02-23T05:57:35.220Z",
        "created_at": "2025-02-23T05:57:35.220Z"
      },
      {
        "id": 14,
        "amount_paid": 1,
        "payment_date": "2025-02-23T05:57:35.868Z",
        "created_at": "2025-02-23T05:57:35.868Z"
      },
      {
        "id": 15,
        "amount_paid": 1,
        "payment_date": "2025-02-23T05:57:36.539Z",
        "created_at": "2025-02-23T05:57:36.539Z"
      },
      {
        "id": 16,
        "amount_paid": 1,
        "payment_date": "2025-02-23T05:57:37.175Z",
        "created_at": "2025-02-23T05:57:37.175Z"
      },
      {
        "id": 17,
        "amount_paid": 1,
        "payment_date": "2025-02-23T05:57:37.843Z",
        "created_at": "2025-02-23T05:57:37.843Z"
      },
      {
        "id": 18,
        "amount_paid": 1,
        "payment_date": "2025-02-23T05:57:38.473Z",
        "created_at": "2025-02-23T05:57:38.473Z"
      }
    ],
    "meta": {
      "total": 37,
      "lastPage": 4,
      "currentPage": 1,
      "perPage": 10,
      "prevPage": null,
      "nextPage": 2
    }
  }
  ```

**Possible Errors:**

- **401 Unauthorized**: When the token is missing or invalid.
- **404 Not Found**: When the loan with the specified ID is not found.

---

## Payment Endpoints

### Create Payment

**Endpoint:**  
`POST {{base_url}}/payments/`

**Request Body Example:**

```json
{
  "loan_id": 21,
  "amount_paid": 1
}
```

**Successful Response:**

- **Status:** 201 Created
- **Body Example:**

  ```json
  {
    "id": 51,
    "amount_paid": 1,
    "loan": {
      "id": 21,
      "amount": 800.6,
      "purpose": "sala",
      "duration": 1,
      "status": "APPROVED",
      "total_paid": 236.5,
      "remaining_balance": 564.1,
      "created_at": "2025-02-23T05:54:34.973Z"
    },
    "payment_date": "2025-02-23T17:27:23.011Z",
    "created_at": "2025-02-23T17:27:23.011Z"
  }
  ```

**Possible Errors:**

- **400 Bad Request**: If the payment details are invalid.
- **401 Unauthorized**: When the token is missing or invalid.
- **404 Not Found**: When the loan with the specified ID is not found.

---

### Get Payment

**Endpoint:**  
`GET {{base_url}}/payments/{paymentId}`

**Successful Response:**

- **Status:** 200 OK
- **Body Example:**

  ```json
  {
    "id": 51,
    "amount_paid": 1,
    "loan": {
      "id": 21,
      "amount": 800.6,
      "purpose": "sala",
      "duration": 1,
      "status": "APPROVED",
      "total_paid": 236.5,
      "remaining_balance": 564.1,
      "created_at": "2025-02-23T05:54:34.973Z"
    },
    "payment_date": "2025-02-23T17:27:23.011Z",
    "created_at": "2025-02-23T17:27:23.011Z"
  }
  ```

**Possible Errors:**

- **401 Unauthorized**: When the token is missing or invalid.
- **404 Not Found**: When the payment with the specified ID is not found.
