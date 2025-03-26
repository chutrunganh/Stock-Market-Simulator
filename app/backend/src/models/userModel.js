// A User model that represents the user entity
class User {
  constructor(userData) {
    this.id = userData.id;
    this.username = userData.username;
    this.email = userData.email;
    this.created_at = userData.created_at;
    this.updated_at = userData.updated_at;
  }
  
  // Returns a user object without sensitive data like password. Other file want to use User
  // model must use this method instead of directly accessing the userData object.
  static getSafeUser(userData) {
    if (!userData) return null;
    
    return {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      created_at: userData.created_at,
      updated_at: userData.updated_at
    };
  }
}

export default User;

