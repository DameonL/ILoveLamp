This is a basic e-commerce example site, featuring a responsive, single-page app with front-end routing.

Product data is stored in a firestore database and retrieved using Google Firestore's REST API.

The app uses a custom HTML element to represent each page; these HTML elements load their respective pages without reloading the current page, allowing for data storage across pages without using a backend. This allows for some front-end performance optimizations such as caching product data, which can reduce load on the database. It also makes it easy to store data such as the shopping cart during a session, without needing to constantly retrieve and store the shopping cart from a cookie.

For displaying product data and the page used to add products to the database, this site features a generalized class designed to map Firestore documents to HTML elements, or create a Javascript object out of designated elements on a page.
