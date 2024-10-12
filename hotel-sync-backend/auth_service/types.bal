type Login record {| 
    string email;
    string password;
|};

type User record {| 
    string email;
    string password_hash;
    string role;
|};