const functions = require('firebase-functions');
const admin = require('firebase-admin');

const serviceAccount = require("./permissions.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://straybirds-restapi.firebaseio.com"
});

const express = require('express');
const app = express();
const db = admin.firestore();
// db.settings({ ignoreUndefinedProperties: true });

const cors = require('cors');
app.use(cors({ origin: true }));

app.post('/api/create', (req, res) => {
  (async () => {
    try {
      await db
        .collection('quotes').doc('/' + req.body.id + '/')
        .create({
          author: req.body.author,
          chapter: req.body.chapter,
          quote: req.body.quote,
        })
      return res.status(200).send('Quote has been created successfully.');
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

app.get('/api/quotes/:id', (req, res) => {
  (async () => {
    try {
      const document = db.collection('quotes').doc(req.params.id);
      let quote = await document.get();
      let response = quote.data();

      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

app.get('/api/quotes', (req, res) => {
  (async () => {
    try {
      let query = db.collection('quotes');
      let response = [];

      await query.get().then(querySnapshot => {
        let docs =  querySnapshot.docs;

        for (let doc of docs) {
          const selectedItem = {
            id: doc.id,
            author: doc.data().author,
            chapter: doc.data().chapter,
            quote: doc.data().quote,
          };
          response.push(selectedItem);
        }
        return response;
      })
      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

app.put('/api/update/:id', (req, res) => {
  (async () => {
    try {
      const document = db.collection('quotes').doc(req.params.id);

      await document.update({
        author: req.body.author,
        chapter: req.body.chapter,
        quote: req.body.quote,
      })
      return res.status(200).send('updated');
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

app.delete('/api/delete/:id', (req, res) => {
  (async () => {
    try {
      const document = db.collection('quotes').doc(req.params.id);
      await document.delete();
      return res.status(200).send('deleted');
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

exports.app = functions.https.onRequest(app);