const CarRentalPlatform = artifacts.require("RentalPlatform");

contract("RentalPlatform", (accounts) => {
  let carRentalPlatform;
  const owner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];

  beforeEach(async () => {
    // carRentalPlatform = await carRentalPlatform.new();
    carRentalPlatform = await CarRentalPlatform.new();
  });

  it("adds a user", async () => {
    await carRentalPlatform.addUser("Alice", "Smith", { from: user1 });
    const user = await carRentalPlatform.getUser(user1);
    assert.equal(user.name, "Alice");
    assert.equal(user.lastname, "Smith");
  });

  it("adds a car", async () => {
    await carRentalPlatform.addCar("Tesla Model S", "https://example.com/img.jpg", 10, 50000, { from: owner });
    const car = await carRentalPlatform.getCar(1);
    assert.equal(car.name, "Tesla Model S");
    assert.equal(car.imgUrl, "https://example.com/img.jpg");
    assert.equal(car.rentFee, 10);
    assert.equal(car.saleFee, 50000);
  });

  it("checks out a car", async () => {
    await carRentalPlatform.addUser("Alice", "Smith", { from: user1 });
    await carRentalPlatform.addCar("Tesla Model S", "https://example.com/img.jpg", 10, 50000, { from: owner });
    await carRentalPlatform.checkOut(1, { from: user1 });
    const user = await carRentalPlatform.getUser(user1);
    assert.equal(user.rentedCarId, 1);
  });

  it("checks in a car", async () => {
    await carRentalPlatform.addUser("Alice", "Smith", { from: user1 });
    await carRentalPlatform.addCar("Tesla Model S", "https://example.com/img.jpg", 10, 50000, { from: owner });
    await carRentalPlatform.checkOut(1, { from: user1 });
    await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait 1 minute
    await carRentalPlatform.checkIn({ from: user1 });
    const user = await carRentalPlatform.getUser(user1);
    assert.equal(user.rentedCarId, 0);
    assert.equal(user.debt, 10);
  });

  it("makes a payment", async () => {
    await carRentalPlatform.addUser("Alice", "Smith", { from: user1 });
    await carRentalPlatform.addCar("Tesla Model S", "https://example.com/img.jpg", 10, 50000, { from: owner });
    await carRentalPlatform.checkOut(1, { from: user1 });
    await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait 1 minute
    await carRentalPlatform.checkIn({ from: user1 });
    await carRentalPlatform.deposit({ from: user1, value: 100 });
    await carRentalPlatform.makePayment({ from: user1 });
    const user = await carRentalPlatform.getUser(user1);
    assert.equal(user.debt, 0);
  });

  it('should edit an existing car with valid parameters', async () => {
    // Create a new car
    await carRentalPlatform.addCar("Tesla Model S", "https://example.com/img.jpg", 10, 50000, { from: owner });

    // Edit the car with new parameters
    const newName = 'Updated Car1';
    const newImgUrl = 'https://updatedcar1image.com';
    const newStatus = 1;
    const newRentFee = 200;
    const newSaleFee = 300;
    await carRentalPlatform.editCar(1, newName, newImgUrl, newStatus, newRentFee, newSaleFee, { from: owner });

    // Get the edited car and check if the changes were applied
    const car = await carRentalPlatform.getCar(1);
    assert.equal(car.name, newName, 'Car name not updated');
    assert.equal(car.imgUrl, newImgUrl, 'Car image URL not updated');
    assert.equal(car.status, newStatus, 'Car status not updated');
    assert.equal(car.rentFee, newRentFee, 'Car rent fee not updated');
    assert.equal(car.saleFee, newSaleFee, 'Car sale fee not updated');
  });
});
