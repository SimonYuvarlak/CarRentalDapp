// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/utils/Counters.sol";

contract RentalPlatform {
  using Counters for Counters.Counter;

  Counters.Counter private _counter;

  // DATA
  //owner
  address private owner;

  // user struct
  struct User {
    address walletAddress;
    string name;
    string lastname;
    uint rentedCarId;
    uint balance;
    uint debt;
    uint start;
    uint end;
  }

  // car struct
  struct Car {
    uint id;
    string name;
    string imgUrl;
    Status status;
    uint rentFee;
    uint saleFee;
  }

  // enum to indicate the status of the car
  enum Status { Retired, InUse, Available }

  // events
  event CarAdded(uint indexed id, string name, string imgUrl, uint rentFee, uint saleFee);
  event CarEdited(uint indexed id, string name, string imgUrl, Status status, uint rentFee, uint saleFee);
  event UserAdded(address indexed walletAddress, string name, string lastname);
  event Deposit(address indexed walletAddress, uint amount);
  event CheckOut(address indexed walletAddress, uint indexed carId);
  event CheckIn(address indexed walletAddress, uint indexed carId);
  event PaymentMade(address indexed walletAddress, uint amount);
  event BalanceWithdrawn(address indexed walletAddress, uint amount);


  // users mapping
  mapping(address => User) public users;

  // cars mapping
  mapping(uint => Car) public cars;

  //constructor
  constructor() {
    owner = msg.sender;
    _counter.increment();
  }

  //MODIFIERS
  //onlyOwner
  modifier onlyOwner() {
    require(msg.sender == owner, "Only the owner can call this function");
    _;
  }

  //FUNCTIONS
  //Execute Functions

  //setOwner #onlyOwner
  function setOwner(address _newOwner) external onlyOwner {
    owner = _newOwner;
  }

  //addUser #nonExisting
  function addUser(string calldata name, string calldata lastname) external {
    require(!isUser(msg.sender), "User already exists!");
    users[msg.sender] = User(msg.sender, name, lastname, 0, 0, 0, 0, 0);

    emit UserAdded(msg.sender, users[msg.sender].name, users[msg.sender].lastname);
  }

  //addCar #onlyOwner #nonExistingCar
  function addCar(string calldata name, string calldata url, uint rent, uint sale) external onlyOwner {
    uint counter = _counter.current();
    cars[counter] = Car(counter, name, url, Status.Available, rent, sale);
    _counter.increment();

    emit CarAdded(counter, cars[counter].name, cars[counter].imgUrl, cars[counter].rentFee, cars[counter].saleFee);
  }

  //editCar #onlyOwner #nonExistingCar
  function editCar(uint id, string calldata name, string calldata imgUrl, Status status, uint rentFee, uint saleFee) external onlyOwner {
    require(cars[id].id != 0, "Car with given ID does not exist.");
    Car storage car = cars[id];
    if(bytes(name).length != 0) {
        car.name = name;
    }
    if(bytes(imgUrl).length != 0) {
        car.imgUrl = imgUrl;
    }
    car.status = status;
    if(rentFee > 0) {
        car.rentFee = rentFee;
    }
    if(saleFee > 0) {
        car.saleFee = saleFee;
    }

    emit CarEdited(id, car.name, car.imgUrl, car.status, car.rentFee, car.saleFee);
  }

  //checkOut #existingUser #carIsAvailable #userHasNotRentedACar #userHasNoDebt
  function checkOut(uint id) external {
    require(isUser(msg.sender), "User does not exist!");
    require(cars[id].status == Status.Available, "Car is not available for rent!");
    require(users[msg.sender].rentedCarId == 0, "User has already rented a car!");
    require(users[msg.sender].debt == 0, "User has an outstanding debt!");

    users[msg.sender].start = block.timestamp;
    users[msg.sender].rentedCarId = id;
    cars[id].status =  Status.InUse;

    emit CheckOut(msg.sender, id);
  }

  //checkIn #existingUser #userHasRentedACar
  function checkIn() external {
    require(isUser(msg.sender), "User does not exist!");
    uint rentedCarId = users[msg.sender].rentedCarId;
    require(rentedCarId != 0, "User has not rented a car!");

    uint usedSeconds = block.timestamp - users[msg.sender].start;
    uint rentFee = cars[rentedCarId].rentFee;
    users[msg.sender].debt += calculateDebt(usedSeconds, rentFee);

    users[msg.sender].rentedCarId = 0;
    users[msg.sender].start = 0;
    users[msg.sender].end = 0;
    cars[rentedCarId].status = Status.Available;

    emit CheckIn(msg.sender, rentedCarId);
  }

  //deposit #existingUser
  function deposit() external payable {
    require(isUser(msg.sender), "User does not exist!");
    users[msg.sender].balance += msg.value;

    emit Deposit(msg.sender, msg.value);
  }

  //makePayment #existingUser #existingDebt #sufficientBalance
  function makePayment() external {
    require(isUser(msg.sender), "User does not exist!");
    uint debt = users[msg.sender].debt;
    uint balance = users[msg.sender].balance;

    require(debt > 0, "User has no debt!");
    require(balance >= debt, "User has insufficient balance!");

    unchecked {
      users[msg.sender].balance -= debt;
    }
    users[msg.sender].debt = 0;

    emit PaymentMade(msg.sender, debt);
  }

  //withdrawBalance
  function withdrawBalance() external {
    require(isUser(msg.sender), "User does not exist!");
    uint balance = users[msg.sender].balance;
    require(balance > 0, "User has no balance to withdraw!");

    (bool success, ) = msg.sender.call{value: balance}("");
    require(success, "Transfer failed.");

    users[msg.sender].balance = 0;
    emit BalanceWithdrawn(msg.sender, balance);
  }

  //Query Functions

  //getOwner
  function getOwner() external view returns(address) {
    return owner;
  }

  //isUser
  function isUser(address walletAddress) internal view returns(bool) {
    return users[walletAddress].walletAddress != address(0);
  }

  //getUser #existingUser
  function getUser(address walletAddress) external view returns (User memory) {
    require(isUser(walletAddress), "User does not exist!");
    return users[walletAddress];
  }

  //getCar #existingCar
  function getCar(uint id) external view returns(Car memory) {
    require(cars[id].id != 0, "Car does not exist!");
    return cars[id];
  }

  //calculateDebt
  function calculateDebt(uint usedSeconds, uint rentFee) private pure returns (uint) {
    uint usedMinutes = usedSeconds / 60;
    return usedMinutes * rentFee;
  }

  //getCurrentCount
  function getCurrentCount() external view returns (uint) {
    return _counter.current();
  }
}
