const fetchData = async () => {
  const urls = [
    "https://fakestoreapi.com/users",
    "https://fakestoreapi.com/carts/?startdate=2000-01-01&enddate=2023-04-07",
    "https://fakestoreapi.com/products",
  ];
  const arrayOfResponses = await Promise.all(
    urls.map((url) => fetch(url).then((res) => res.json()))
  );

  let obj = {
    users: arrayOfResponses[0],
    carts: arrayOfResponses[1],
    products: arrayOfResponses[2],
  };

  return obj;
};

const getProductCategoriesAndValues = (products) => {
  const productCategories = new Map();

  products.forEach((product) => {
    if (productCategories.has(product.category)) {
      productCategories.set(
        product.category,
        productCategories.get(product.category) + product.price
      );
    } else {
      productCategories.set(product.category, product.price);
    }
  });

  return productCategories;
};

const getPricesOfProducts = (products) => {
  const productPrices = new Map();

  products.forEach((product) => {
    if (!productPrices.has(product.id)) {
      productPrices.set(product.id, product.price);
    }
  });
  return productPrices;
};

const getNamesOfClients = (users) => {
  const usersNames = new Map();

  users.forEach((user) => {
    if (!usersNames.has(user.id)) {
      usersNames.set(user.id, user.name);
    }
  });
  return usersNames;
};

const findCartWithHighestValue = (carts, prices, users) => {
  let highestCartValue;
  let cartOwner;
  carts.forEach((cart) => {
    let cartValue = calculateCartValue(cart.products, prices);
    if (highestCartValue === undefined || highestCartValue < cartValue) {
      highestCartValue = cartValue;
      cartOwner = cart.userId;
    }
  });

  let credentials = users.get(cartOwner);

  cartOwner = `${credentials.firstname} ${credentials.lastname}`;

  return [highestCartValue, cartOwner];
};

const calculateCartValue = (cart, prices) => {
  let sum = 0;
  cart.forEach((product) => {
    sum += prices.get(product.productId) * product.quantity;
  });
  return sum;
};

const calculateDistance = (lat1, long1, lat2, long2) => {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((long2 - long1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const findMostDistantUsers = (users) => {
  let maximumDistance = 0;
  let firstUser;
  let secondUser;

  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const firstUserLat = users[i].address.geolocation.lat;
      const firstUserLong = users[i].address.geolocation.long;
      const secondUserLat = users[j].address.geolocation.lat;
      const secondUserLong = users[j].address.geolocation.long;
      let calculatedDistance = calculateDistance(
        parseFloat(firstUserLat),
        parseFloat(firstUserLong),
        parseFloat(secondUserLat),
        parseFloat(secondUserLong)
      );
      if (calculatedDistance > maximumDistance) {
        maximumDistance = calculatedDistance;
        firstUser = users[i];
        secondUser = users[j];
      }
    }
  }

  return [firstUser, secondUser, maximumDistance];
};

const main = async () => {
  const data = await fetchData();
  const productCategories = getProductCategoriesAndValues(data.products);
  const productPrices = getPricesOfProducts(data.products);
  const userNames = getNamesOfClients(data.users);
  const cartWithHighestValue = findCartWithHighestValue(
    data.carts,
    productPrices,
    userNames
  );
  const mostDistance = findMostDistantUsers(data.users);

  console.log(
    "Product categories and total value of products of a given category:"
  );
  console.log(productCategories);

  console.log("Cart with the highest value and its owner: ");
  console.log(cartWithHighestValue);

  console.log("Two users living the furthest away from each other");
  console.log(
    `${mostDistance[0].name.firstname} ${mostDistance[0].name.lastname} and ${mostDistance[1].name.firstname} ${mostDistance[1].name.lastname} with a distance of ${mostDistance[2]} metres`
  );
};

main();
