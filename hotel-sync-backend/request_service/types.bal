// Record type for adding a service request
type AddServiceRequest record {| 
    string description;
    int assigned_to_staff;
    string status;
|};

// Record type for service request with ID (used when fetching requests)
type ServiceRequestWithId record {| 
    int id;
    string description;
    int assigned_to_staff;
    string status;
    string created_at;
    string updated_at;
|};

// Record type for updating a service request (No ID needed)
type ServiceRequestUpdate record {| 
    string description;
    int assigned_to_staff;
    string status;
|};