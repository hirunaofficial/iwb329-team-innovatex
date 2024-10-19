// Record type for full user data (used for adding users)
type UserWithPassword record {| 
    string? nic;
    string? name;
    string? email;
    string? phone_number;
    string? address;
    string? password_hash;
    string? role;
|};

// Record type for fetching and editing users (without password)
type UserWithoutPassword record {| 
    int? id;
    string? nic;
    string? name;
    string? email;
    string? phone_number;
    string? address;
    string? role;
    string? status;
|};

// Record type for password update
type PasswordUpdate record {| 
    string new_password;
|};

// Record type for staff members
type StaffMember record {| 
    int id;
    string name;
|};