// Record type for adding a room (No ID needed)
type AddRoomRequest record {| 
    string room_number;
    string room_type;
    string status;
    decimal price;
    string? description;
|};

// Record type for room with ID (used when fetching rooms)
type RoomWithId record {| 
    int id;
    string room_number;
    string room_type;
    string status;
    decimal price;
    string? description;
|};

// Record type for updating a room (No ID, but similar to AddRoomRequest)
type RoomUpdateRequest record {| 
    string room_number;
    string room_type;
    string status;
    decimal price;
    string description;
|};