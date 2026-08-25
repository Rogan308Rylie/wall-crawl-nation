const { getAdminDb } = require('./lib/firebaseAdmin');

async function test() {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection('posters').limit(5).get();
    snapshot.forEach(doc => {
      console.log(doc.id, '=>', doc.data());
    });
  } catch(e) {
    console.error(e);
  }
}

test();
