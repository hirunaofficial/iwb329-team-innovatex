type User record {| 
    int id?;
    string nic;
    string name;
    string email;
    string phone_number;
    string password_hash;
    string role;
    string address?;
    string status;
    string created_at?;
|};

type Login record {|
    string email;
    string password;
|};