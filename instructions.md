## Registering provider

Make sure to register the adonis-mongodb provider to make use of `MongoClient`. The providers are registered inside `start/app.js`

```js
const providers = ['adonis-mongodb/providers/AdonisMongodbProvider'];
```

### Config mongodb collection

the config automatic create to `config/mongodb.js` file

```js
module.exports = {
    uri: Env.get('DB_URI', null),
    hosts_replicaset: Env.get('DB_HOSTS_REPLICASET', null),
    host: Env.get('DB_HOST', 'localhost'),
    port: Env.get('DB_PORT', 27017),
    username: Env.get('DB_USER', 'admin'),
    password: Env.get('DB_PASSWORD', ''),
    database: Env.get('DB_DATABASE', 'adonis'),
    options: {
        authSource: Env.get('DB_AUTH_SOURCE', ''),
        replicaSet: Env.get('DB_REPLICA_SET', null),
        readPreference: Env.get('DB_READ_PREF', null),
        maxStalenessSeconds: Env.get('DB_MAX_STALE', null)
    },
};
```

## Usage

### Using MONGO DB URI String

add to .env file
```js
DB_URI=mongodb://USER:PASSWORD@HOST_IP_1,HOST_IP_2,HOST_IP_3/DB_NAME?authSource=AUTHSOURCE_NAME&replicaSet=REPLICASET_NAME&readPreference=PRIMARY_SECONDARY&maxStalenessSeconds=SECOND
```

### Using Normal .env Variable

add to .env file
```js
DB_HOSTS_REPLICASET=HOST_IP_1,HOST_IP_2,HOST_IP_3
DB_USER=USERNAME
DB_PASS=PASSWORD
DB_DATABASE=DATABASE_NAME
DB_AUTH_SOURCE=AUTHSOURCE_NAME
DB_REPLICA_SET=REPLICASET_NAME
DB_READ_PREF=PRIMARY_SECONDARY
DB_MAX_STALE=SECOND
```

Once done you can access `Database` provider and run mongo queries as follows.

```js
const MongoClient = use('MongoClient')
const { ObjectID } = use('mongodb')

await MongoClient.db.collection('users').find().toArray()

await MongoClient.db.collection('users').findOne(_id: ObjectID('5de505539f99ff6318da7292'))

await MongoClient.db.collection('users').aggregate([
    {
        $match: {
            _id: {
                $eq: ObjectID('5de505539f99ff6318da7292')
            }
        }
    }
]).toArray()

await MongoClient.db.collection('users').insertOne({ name: 'Brito' })

await MongoClient.db.collection('users').deleteOne({ name: 'Brito' })

/** This method will create a document with createAt and updateAt extra fields
 * If the second parameter has _id as a valid ObjectID, this will update the document that relates with _id and update field updateAt
 * Otherwise will throw an Error 'Invalid ObjectId'
 */
await MongoClient.createOrUpdate('users', { name: 'Brito' })
```
