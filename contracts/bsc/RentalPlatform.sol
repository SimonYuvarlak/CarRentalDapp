// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

contract RentalPlatform {
    event UserAdded(address indexed user, string name, string lastname);
    event CarAdded(uint indexed id, string name, string imgUrl, uint rentFee, uint saleFee);
    event CarActivated(uint indexed id);
    event CarDeactivated(uint indexed id);
    event CheckedOut(address indexed user, uint indexed carId, uint timestamp);
    event CheckedIn(address indexed user, uint indexed carId, uint startTimestamp, uint endTimestamp);
    event PaymentMade(address indexed user, uint amount);


    address private owner;

    struct User {
        address payable walletAddress;
        string name;
        string lastname;
        uint rentedCarId;
        uint balance;
        uint debt;
        uint start;
        uint end;
    }

    struct Car {
        uint id;
        string name;
        string imgUrl;
        bool availableForRent;
        uint rentFee; // for every minute
        uint saleFee;
    }

    mapping(address => User) public users;
    mapping(uint => Car) public cars;
    uint[] public carIds;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner required");
        _;
    }

    function setOwner(address payable _newOwner) external onlyOwner{
        owner = _newOwner;
    }

    function getOwner() external view returns(address) {
        return owner;
    }

    function isUser(address payable walletAddress) public view returns (bool) {
        return users[walletAddress].walletAddress != address(0);
    }

    function addUser(address payable walletAddress, string memory name, string memory lastname) public {
        require(!isUser(walletAddress), "User already exists!");
        users[walletAddress] = User(walletAddress, name, lastname, 0, 0, 0, 0, 0);
        emit UserAdded(walletAddress, name, lastname);
    }

    function getUser(address payable walletAddress) public view returns (User memory) {
        require(isUser(walletAddress), "User does not exist!");
        return users[walletAddress];
    }

    function addCar(uint id, string memory name, string memory url, uint rent, uint sale) public onlyOwner {
        require(cars[id].id == 0, "Car with this id already exists!");
        cars[id] = Car(id, name, url, true, rent, sale);
        carIds.push(id);
        emit CarAdded(id, name, url, rent, sale);
    }

    function activateCar(uint id) public onlyOwner {
        require(cars[id].id != 0, "Car does not exist!");
        cars[id].availableForRent = true;
        emit CarActivated(id);
    }

    function deactivateCar(uint id) public onlyOwner {
        require(cars[id].id != 0, "Car does not exist!");
        cars[id].availableForRent = false;
        emit CarDeactivated(id);
    }

    function isCarActive(uint id) public view returns (bool) {
        require(cars[id].id != 0, "Car does not exist!");
        return cars[id].availableForRent;
    }

    function deposit(address payable walletAddress) public payable {
        require(isUser(walletAddress), "User does not exist!");
        users[walletAddress].balance += msg.value;
    }


    function checkOut(address payable walletAddress, uint id) public {
        require(isUser(walletAddress), "User does not exist!");
        require(isCarActive(id), "Car is not available for rent!");
        require(users[walletAddress].rentedCarId == 0, "User has already rented a car!");
        require(users[walletAddress].debt == 0, "User has an outstanding debt!");

        users[walletAddress].rentedCarId = id;
        users[walletAddress].start = block.timestamp;
        cars[id].availableForRent = false;
        emit CheckedOut(walletAddress, id, block.timestamp);
    }

    function checkIn(address payable walletAddress) public {
        require(isUser(walletAddress), "User does not exist!");
        uint rentedCarId = users[walletAddress].rentedCarId;
        require(rentedCarId != 0, "User has not rented a car!");

        users[walletAddress].end = block.timestamp;
        users[walletAddress].debt += calculateDebt(walletAddress);

        users[walletAddress].rentedCarId = 0;
        uint start = users[walletAddress].start;
        users[walletAddress].start = 0;
        users[walletAddress].end = 0;
        cars[rentedCarId].availableForRent = true;
        emit CheckedIn(walletAddress, rentedCarId, start, block.timestamp);
    }

    function calculateDebt(address payable walletAddress) internal view returns (uint) {
        uint rentedCarId = users[walletAddress].rentedCarId;
        uint rentFee = cars[rentedCarId].rentFee;
        uint usedMinutes = (users[walletAddress].end - users[walletAddress].start) / 60;

        return usedMinutes * rentFee;
    }

    function makePayment(address payable walletAddress) public {
        require(isUser(walletAddress), "User does not exist!");
        uint debt = users[walletAddress].debt;
        uint balance = users[walletAddress].balance;

        require(debt > 0, "User has no debt!");
        require(balance >= debt, "User has insufficient balance!");

        users[walletAddress].balance -= debt;
        users[walletAddress].debt = 0;
        emit PaymentMade(walletAddress, debt);
    }

    function getCarIds() public view returns (uint[] memory) {
        return carIds;
    }

    function getCar(uint id) public view returns (Car memory) {
        require(cars[id].id != 0, "Car does not exist!");
        return cars[id];
    }

    function getUserDebt(address payable walletAddress) public view returns (uint) {
        require(isUser(walletAddress), "User does not exist!");
        return users[walletAddress].debt;
    }

    function getUserBalance(address payable walletAddress) public view returns (uint) {
        require(isUser(walletAddress), "User does not exist!");
        return users[walletAddress].balance;
    }
}