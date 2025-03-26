# User CRUD
- Register a new user:
    - Method: POST
    - URL: `http://localhost:3000/api/user`
    - Body:
        ```json
        {
        "username": "testuser2",
        "email": "test2@example.com",
        "password": "password123"
        }
        ```
- Get all users:
    - Method: GET
    - URL: `http://localhost:3000/api/user`

- Get a user by ID:
    - Method: GET
    - URL: `http://localhost:3000/api/user/2` (replace `2` with the actual user ID)

- Update a user by ID
    - Method: PUT
    - URL: `http://localhost:3000/api/user/2` (replace `2` with the actual user ID)
    - Body:
        ```json
        {
            "username": "updatedname",
            "email": "updated@example.com",
            "password": "newpassword"
        }
        ```
- Delete a user by ID:
    - Method: DELETE
    - URL: `http://localhost:3000/api/user/2` (replace `2` with the actual user ID)