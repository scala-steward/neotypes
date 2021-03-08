// When the user clicks on the search box, we want to toggle the search dropdown
function displayToggleSearch(e) {
  e.preventDefault();
  e.stopPropagation();

  closeDropdownSearch(e);
  
  if (idx === null) {
    console.log("Building search index...");
    prepareIdxAndDocMap();
    console.log("Search index built.");
  }
  const dropdown = document.querySelector("#search-dropdown-content");
  if (dropdown) {
    if (!dropdown.classList.contains("show")) {
      dropdown.classList.add("show");
    }
    document.addEventListener("click", closeDropdownSearch);
    document.addEventListener("keydown", searchOnKeyDown);
    document.addEventListener("keyup", searchOnKeyUp);
  }
}

//We want to prepare the index only after clicking the search bar
var idx = null
const docMap = new Map()

function prepareIdxAndDocMap() {
  const docs = [  
    {
      "title": "Alternative effects",
      "url": "/neotypes/alternative_effects.html",
      "content": "Alternative effects neotypes comes with four effect implementations: Future, cats-effect, Monix &amp; ZIO. scala.concurrent.Future (neotypes) import neotypes.GraphDatabase import neotypes.implicits.syntax.string._ // Provides the query[T] extension method. // Provides the query[T] extension method. import scala.concurrent.{Await, Future} import scala.concurrent.ExecutionContext.Implicits.global import scala.concurrent.duration._ // Provides the second extension method. // Provides the second extension method. import org.neo4j.driver.AuthTokens val driver = GraphDatabase.driver[Future](\"bolt://localhost:7687\", AuthTokens.basic(\"neo4j\", \"****\")) val program: Future[String] = for { data &lt;- \"MATCH (p: Person { name: 'Charlize Theron' }) RETURN p.name\".query[String].single(driver) _ &lt;- driver.close } yield data val data: String = Await.result(program, 1.second) Note: The previous example does not handle failures. Thus, it may leak resources. cats.effect.IO (neotypes-cats-effect) import cats.effect.{IO, Resource} import neotypes.{GraphDatabase, Driver} import neotypes.cats.effect.implicits._ // Brings the implicit neotypes.Async[IO] instance into the scope. // Brings the implicit neotypes.Async[IO] instance into the scope. import neotypes.implicits.syntax.string._ // Provides the query[T] extension method. // Provides the query[T] extension method. import org.neo4j.driver.AuthTokens val driver: Resource[IO, Driver[IO]] = GraphDatabase.driver[IO](\"bolt://localhost:7687\", AuthTokens.basic(\"neo4j\", \"****\")) val program: IO[String] = driver.use { d =&gt; \"MATCH (p: Person { name: 'Charlize Theron' }) RETURN p.name\".query[String].single(d) } val data: String = program.unsafeRunSync() cats.effect.neotypes.Async[F] (neotypes-cats-effect) import cats.effect.{Async, IO, Resource} import neotypes.{GraphDatabase, Driver} import neotypes.cats.effect.implicits._ // Brings the implicit neotypes.Async[IO] instance into the scope. // Brings the implicit neotypes.Async[IO] instance into the scope. import neotypes.implicits.syntax.string._ // Provides the query[T] extension method. // Provides the query[T] extension method. import org.neo4j.driver.AuthTokens def driver[F[_] : Async]: Resource[F, Driver[F]] = GraphDatabase.driver[F](\"bolt://localhost:7687\", AuthTokens.basic(\"neo4j\", \"****\")) def program[F[_] : Async]: F[String] = driver[F].use { d =&gt; \"MATCH (p: Person { name: 'Charlize Theron' }) RETURN p.name\".query[String].single(d) } val data: String = program[IO].unsafeRunSync() monix.eval.Task (neotypes-monix) import cats.effect.Resource import monix.eval.Task import monix.execution.Scheduler.Implicits.global import neotypes.{GraphDatabase, Driver} import neotypes.implicits.syntax.string._ // Provides the query[T] extension method. // Provides the query[T] extension method. import neotypes.monix.implicits._ // Brings the implicit neotypes.Async[Task] instance into the scope. // Brings the implicit neotypes.Async[Task] instance into the scope. import scala.concurrent.duration._ // Provides the second extension method. // Provides the second extension method. import org.neo4j.driver.AuthTokens val driver: Resource[Task, Driver[Task]] = GraphDatabase.driver[Task](\"bolt://localhost:7687\", AuthTokens.basic(\"neo4j\", \"****\")) val program: Task[String] = driver.use { d =&gt; \"MATCH (p: Person { name: 'Charlize Theron' }) RETURN p.name\".query[String].single(d) } val data: String = program.runSyncUnsafe(1.second) zio.Task (neotypes-zio) import zio.{Runtime, Managed, Task} import neotypes.{GraphDatabase, Driver} import neotypes.implicits.syntax.string._ // Provides the query[T] extension method. // Provides the query[T] extension method. import neotypes.zio.implicits._ // Brings the implicit neotypes.Async[Task] instance into the scope. // Brings the implicit neotypes.Async[Task] instance into the scope. import org.neo4j.driver.AuthTokens val driver: Managed[Throwable, Driver[Task]] = GraphDatabase.driver[Task](\"bolt://localhost:7687\", AuthTokens.basic(\"neo4j\", \"****\")) val program: Task[String] = driver.use { d =&gt; \"MATCH (p: Person { name: 'Charlize Theron' }) RETURN p.name\".query[String].single(d) } val runtime = Runtime.default val data: String = runtime.unsafeRun(program) Custom effect type In order to support your any other effect type, you need to implement the neotypes.Async.Aux[F[_], R[_]] typeclasses and add them to the implicit scope. The type parameters in the signature indicate: F[_] - the effect type. R[_] - the resource used to wrap the creation of Drivers."
    } ,    
    {
      "title": "Changelog",
      "url": "/neotypes/changelog.html",
      "content": "Changelog v0.16.0 (2021-02-09) Removing Session &amp; Using the new Rx module for Streaming (#221) We replaced our in-house implementation of Streaming with wrappers for the new Rx module of the Java driver. During this change we also removed Session since it wasn’t actually needed. This change implies that now you can chose between a normal Driver[F] or a StreamingDriver[S, F], the latter can be used to create both a normal Transaction[F] or a StreamingTransaction[S, F]. The first one no longer supports streaming data from the database, but the second one implies that even no-streaming operations like single are implemented in terms of ReactiveStreams. However, if you use single query + auto-commit syntax provided by DeferredQuery then you will use normal (asynchronous) Transactions for most operations and Streaming Transactions only for stream queries. This is quite a big change, because now the Stream typeclass doesn’t need to be in scope when calling stream, but rather when creating the Driver; By calling GraphDatabase.streamingDriver[S[_]] // Replace this: val driverR: Resource[IO, neotypes.Driver[IO]] = ??? val sessionR = driverR.flatMap(_.session) val data = fs2.Stream.resource(sessionR).flatMap { s =&gt; \"MATCH (p:Person) RETURN p.name\".query[String].stream[Fs2IoStream](s) } // With this: val driverR: Resource[IO, StreamingDriver[Fs2IoStream, IO]] = GraphDatabase.streamingDriver[Fs2IoStream](\"bolt://localhost:7687\", AuthTokens.basic(\"neo4j\", \"****\")) val data = for { driver &lt;- fs2.Stream.resource(driverR) name &lt;- \"MATCH (p:Person) RETURN p.name\".query[String].stream(driver) } yield name For more information, please read streaming. Rollback on cancellation (c6c43d24f8e0c82db40387fa600490c4b85fa297) Cancelling an effectual operation that was using a Transaction will now rollback the Transaction instead of commit it. Note: This should have been its own PR but due the problems on #164 it ended up being a commit on #221. Add auto and semiauto derivation (#199) Automatic derivation of Mappers for case classes is now opt-in, and Mappers for primitive values are now always on the implicit scope (without needing any import). Also, we now provide some semiauto.derive methods which can be used to cache Mapper instances for case classes (and product types). This change also gives higher priority to custom Mappers on the companion objects of the target types, over automatically derived ones. If you want to keep using automatic derivation you only need to: - import import neotypes.implicits.mappers.all._ + import neotypes.generic.auto._ For more information, please read supported types. Support case class by cypher string interpolator (#201) Now you can pass case class instances directly to cypher string interpolator, this will add all their properties as parameters of the query. For example: import neotypes.generic.auto._ // Provides automatic derivation of ParameterMapper for any case class. // Provides automatic derivation of ParameterMapper for any case class. import neotypes.implicits.syntax.cypher._ // Adds the ` interpolator into the scope. // Adds the ` interpolator into the scope. final case class User(name: String, age: Int) val user = User(\"my name\", 33) val query = c\"\"\"CREATE (u: User { $user }) RETURN u\"\"\" For more information, please read parameterized queries. v0.15.1 (2020-09-08) Fix id handling (#174) neotypes now ensures that if you have a custom id property, that one takes precedence over the system (neo4j) one. For more information, please read neo4j id. v0.15.0 (2020-07-30) Making Session thread safe (#163) neotypes.Session is now thread safe, by ensuring only one active neotypes.Transaction per session. For more information, please read thread safety. v0.14.0 (2020-07-10) Upgrade neo4j java driver to version 4 (#140) neotypes is now published for the v4 version of the Java driver, instead of the 1.7.x version. v0.13.2 (2020-02-23) Case class mapper for maps (#60) You can now query for a case class when returning a node or a map projection. Fix composite types (#61) neotypes now supports all composite types. v0.13.1 (2020-01-09) Bug fixes and improvements to the docs. Special thanks to @geoffjohn11 v0.13.0 (2019-09-11) Scala 2.13 support (#45) neotypes is now cross compiled for Scala 2.12 &amp; 2.13, instead of for 2.11 &amp; 2.12. v0.12.0 (2019-08-25)"
    } ,    
    {
      "title": "Transactions",
      "url": "/neotypes/driver_transaction.html",
      "content": "Driver -&gt; Transaction These two classes are the main points of interactions with a Neo4j database. A Driver is basically the connection with the Database, and provides a context for performing operations (Transactions) over the database. Usually, you would only need one instance per application. A Transaction is a logical container for an atomic unit of work. A single Driver can start multiple concurrent Transactions. Note: Like its Java counterpart, neotypes.Driver is thread safe but neotypes.Transaction is not. Transaction management Each Transaction has to be started, used and finally, either committed or rolled back. neotypes provides 3 ways of interacting with Transactions, designed for different use cases. Single query + automatic commit / rollback. If you only need to perform one query, and want it to be automatically committed in case of success, or rolled back in case of failure. You can use the Driver directly. import neotypes.Driver import neotypes.implicits.syntax.string._ // Provides the query[T] extension method. // Provides the query[T] extension method. def result(driver: Driver[F]): F[String] = \"MATCH (p: Person { name: 'Charlize Theron' }) RETURN p.name\" .query[String] .single(driver) Multiple queries + automatic commit / rollback. Like the previous one, but with the possibility of executing multiple queries in the same Transaction. You can use Driver.transact method. import neotypes.Driver import neotypes.implicits.syntax.string._ // Provides the query[T] extension method. // Provides the query[T] extension method. def result(driver: Driver[F]): F[(String, String)] = driver.transact { tx =&gt; for { r1 &lt;-\"MATCH (p: Person { name: 'Charlize Theron' }) RETURN p.name\".query[String].single(tx) r2 &lt;-\"MATCH (p: Person { name: 'Tom Hanks' }) RETURN p.name\".query[String].single(tx) } yield (r1, r2) } Note: under the hood, the previous method uses this one. Thus, they are equivalent for single-query operations. Multiple queries + explicit commit / rollback. If you want to control when to commit or rollback a Transaction. You can use the Driver.transaction method, to create an F[Transaction[F]]. import neotypes.Driver import neotypes.implicits.syntax.string._ // Provides the query[T] extension method. // Provides the query[T] extension method. def result(driver: Driver[F]): F[Unit] = driver.transaction.flatMap { tx =&gt; for { _ &lt;-\"CREATE (p: Person { name: 'Charlize Theron' })\".query[Unit].execute(tx) _ &lt;-\"CREATE (p: Person { name: 'Tom Hanks' })\".query[Unit].execute(tx) _ &lt;- tx.rollback // Nothing will be done. } yield () } Note: It is mandatory to only call either commit or rollback once. Calling both or one of them but more than once will leave the system in an undefined state. (probably an error or a deadlock) Transaction configuration. You can configure the timeout, access mode, database and metadata of a Transaction Using a custom TransactionConfig import neotypes.TransactionConfig import neotypes.types.QueryParam import scala.concurrent.duration._ val config = TransactionConfig .default .withTimeout(2.seconds) .withMetadata(Map(\"foo\" -&gt; QueryParam(\"bar\"), \"baz\" -&gt; QueryParam(10))) // config: TransactionConfig = neotypes.TransactionConfig@2a8e3c7 Which you can use in operations that explicitly or implicitly create Transactions. import neotypes.{Driver, Transaction} import neotypes.implicits.syntax.string._ // Provides the query[T] extension method. // Provides the query[T] extension method. def customTransaction(driver: Driver[F]): F[Transaction[F]] = driver.transaction(config) def result1(driver: Driver[F]): F[(String, String)] = driver.transact(config) { tx =&gt; for { r1 &lt;-\"MATCH (p:Person {name: 'Charlize Theron'}) RETURN p.name\".query[String].single(tx) r2 &lt;-\"MATCH (p:Person {name: 'Tom Hanks'}) RETURN p.name\".query[String].single(tx) } yield (r1, r2) } def result2(driver: Driver[F]): F[String] = \"MATCH (p:Person {name: 'Charlize Theron'}) RETURN p.name\" .query[String] .single(driver, config)"
    } ,    
    {
      "title": "Home",
      "url": "/neotypes/",
      "content": "neotype - a type specimen that is selected subsequent to the description of a species to replace a preexisting type that has been lost or destroyed. neotypes Scala lightweight, type-safe, asynchronous driver (not opinionated on side-effect implementation) for neo4j. Scala - the driver provides you with support for all standard Scala types without the need to convert Scala &lt;-&gt; Java types back and forth and you can easily add your types. Lightweight - the driver depends on Shapeless and Neo4j Java driver. Type-safe - the driver leverages typeclasses to derive all needed conversions at the compile time. Asynchronous - the driver sits on top of asynchronous Java driver. Not opinionated on side-effect implementation - you can use it with any implementation of side-effects of your chose (scala.Future, cats-effect IO, Monix Task, etc) by implementing a simple typeclass. scala.Future is implemented and comes out of the box. The project aims to provide seamless integration with most popular scala infrastructures such as Lightbend (Akka, Akka-http, Lagom, etc), Typelevel (cats, http4s, etc), Twitter (finch, etc)… Setup \"com.dimafeng\" %% \"neotypes\" % version core functionality. Supports scala.concurrent.Future. \"com.dimafeng\" %% \"neotypes-cats-effect\" % version cats.effect.Async[F] implementation. \"com.dimafeng\" %% \"neotypes-monix\" % version monix.eval.Task implementation. \"com.dimafeng\" %% \"neotypes-zio\" % version zio.Task implementation. \"com.dimafeng\" %% \"neotypes-akka-stream\" % version result streaming for Akka Streams. \"com.dimafeng\" %% \"neotypes-fs2-stream\" % version result streaming for FS2. \"com.dimafeng\" %% \"neotypes-monix-stream\" % version result streaming for Monix Observables. \"com.dimafeng\" %% \"neotypes-zio-stream\" % version result streaming for ZIO ZStreams. \"com.dimafeng\" %% \"neotypes-refined\" % version support to insert and retrieve refined values. \"com.dimafeng\" %% \"neotypes-cats-data\" % version support to insert and retrieve cats.data values. Showcase import neotypes.GraphDatabase import neotypes.generic.auto._ import neotypes.implicits.syntax.all._ import org.neo4j.driver.AuthTokens import scala.concurrent.{Await, Future} import scala.concurrent.ExecutionContext.Implicits.global import scala.concurrent.duration._ val driver = GraphDatabase.driver[Future](\"bolt://localhost:7687\", AuthTokens.basic(\"neo4j\", \"****\")) val people = \"MATCH (p: Person) RETURN p.name, p.born LIMIT 10\".query[(String, Int)].list(driver) Await.result(people, 1.second) // res: Seq[(String, Int)] = ArrayBuffer( // (Charlize Theron, 1975), // (Keanu Reeves, 1964), // (Carrie-Anne Moss, 1967), // (Laurence Fishburne, 1961), // (Hugo Weaving, 1960), // (Lilly Wachowski, 1967), // (Lana Wachowski, 1965), // (Joel Silver,1952), // (Emil Eifrem,1978), // (Charlize Theron,1975) // ) final case class Person(id: Long, born: Int, name: Option[String], notExists: Option[Int]) val peopleCC = \"MATCH (p: Person) RETURN p LIMIT 10\".query[Person].list(driver) Await.result(peopleCC, 1.second) // res: Seq[Person] = ArrayBuffer( // Person(0, 1975, Some(Charlize Theron), None), // Person(1, 1964, Some(Keanu Reeves), None), // Person(2, 1967, Some(Carrie-Anne Moss), None), // Person(3, 1961, Some(Laurence Fishburne), None), // Person(4, 1960, Some(Hugo Weaving), None), // Person(5, 1967, Some(Lilly Wachowski), None), // Person(6, 1965, Some(Lana Wachowski), None), // Person(7, 1952, Some(Joel Silver), None), // Person(8, 1978, Some(Emil Eifrem), None), // Person(9, 1975, Some(Charlize Theron), None) // ) Await.ready(driver.close, 1.second) Compatibility matrix Neo4j version Neotypes version 3.5.x &lt;= 0.13 4.y.x &gt;= 0.14"
    } ,    
    {
      "title": "Overview",
      "url": "/neotypes/overview.html",
      "content": "Overview Requirements Scala 2.13 / 2.12 Java 8+ Neo4j 4+ Session creation neotypes provides the GraphDatabase factory for creating a Neo4j Driver, which represents a connection with the Database. You can use this Driver to perform operations (Transactions) over the Database. Those Scala classes are nothing more than simple wrappers over their Java counterparts, but providing a more “Scala-friendly” and functional API. You can create wrappers for any effectual type (F[_]) for which you have an implementation of the neotypes.Async typeclass in scope. The implementation for scala.concurrent.Future is built-in in the core module (for other types, please read alternative effects). import neotypes.GraphDatabase import neotypes.generic.auto._ // Allows to automatically derive an implicit ResultMapper for case classes. // Allows to automatically derive an implicit ResultMapper for case classes. import neotypes.implicits.syntax.string._ // Provides the query[T] extension method. // Provides the query[T] extension method. import org.neo4j.driver.AuthTokens import scala.concurrent.Future import scala.concurrent.ExecutionContext.Implicits.global final case class Movie(title: String, released: Int) val driver = GraphDatabase.driver[Future](\"bolt://localhost:7687\", AuthTokens.basic(\"neo4j\", \"****\")) val result: Future[List[Movie]] = \"\"\"MATCH (movie: Movie) WHERE lower(movie.title) CONTAINS \"thing\" RETURN movie\"\"\".query[Movie].list(driver) Please remember that, you have to make sure that the Driver is properly closed at the end of the application execution, to make sure all obtained resources (such as network connections) are cleaned up properly. Note: for other effect types instead of Future (e.g. IO), the creation of the Driver will be managed by the effect specific implementation of Resource; which usually ensures it is properly closed after its use. Query execution Once you have a Driver instance, you can start querying the database. The import neotypes.implicits.syntax.all._ adds an extension method query[T] to each string literal in its scope, or you can use the cypher (c) string interpolator. import neotypes.types.QueryParam // Simple query. \"CREATE (p: Person { name: 'John', born: 1980 })\" .query[Unit] .execute(driver) // Query with custom parameters (manual). \"CREATE (p: Person { name: $name, born: $born })\" .query[Unit] .withParams(Map(\"name\" -&gt; QueryParam(\"John\"), \"born\" -&gt; QueryParam(1980))) .execute(driver) // Query wih custom parameters (string interpolator). val name = \"John\" val born = 1980 c\"CREATE (p: Person { name: $name, born: $born })\" .query[Unit] .execute(driver) A query can be run in six different ways: execute(driver) - executes a query and discards its output, it can be parametrized by org.neo4j.driver.v1.summary.ResultSummary or Unit (if you need to support a different type for this type of queries, you can provide an implementation of ExecutionMapper). single(driver) - runs a query and return a single result. list(driver) - runs a query and returns a List of results. set(driver) - runs a query and returns a Set of results. vector(driver) - runs a query and returns a Vector of results. map(driver) - runs a query and returns a Map of results (only if the elements are tuples). collectAs(Col)(driver) - runs a query and returns a Col of results (where Col is any kind of collection). If you are in 2.12 or you are cross-compiling with 2.12 you need to import neotypes.implicits.mappers.collections._ or you can import scala.collection.compat._. stream(driver) - runs a query and returns a Stream of results (for more information, please read streaming). import neotypes.generic.auto._ import neotypes.implicits.mappers.collections._ import org.neo4j.driver.Value import scala.collection.immutable.{ListMap, ListSet} import shapeless.{::, HNil} final case class Movie(title: String, released: Int) final case class Person(name: String, born: Int) // Execute. \"CREATE (p: Person { name: 'Charlize Theron', born: 1975 })\".query[Unit].execute(driver) // Single. \"MATCH (p: Person { name: 'Charlize Theron' }) RETURN p.name\".query[String].single(driver) \"MATCH (p: Person { name: 'Charlize Theron' }) RETURN p\".query[Person].single(driver) \"MATCH (p: Person { name: 'Charlize Theron' }) RETURN p\".query[Map[String, Value]].single(driver) \"MATCH (p: Person { name: '1243' }) RETURN p.born\".query[Option[Int]].single(driver) // List. \"MATCH (p: Person { name: 'Charlize Theron' })-[]-&gt;(m: Movie) RETURN p,m\".query[Person :: Movie :: HNil].list(driver) \"MATCH (p: Person { name: 'Charlize Theron' })-[]-&gt;(m: Movie) RETURN p,m\".query[(Person, Movie)].list(driver) // Set. \"MATCH (p: Person { name: 'Charlize Theron' })-[]-&gt;(m: Movie) RETURN p,m\".query[Person :: Movie :: HNil].set(driver) \"MATCH (p: Person { name: 'Charlize Theron' })-[]-&gt;(m: Movie) RETURN p,m\".query[(Person, Movie)].set(driver) // Vector. \"MATCH (p: Person { name: 'Charlize Theron' })-[]-&gt;(m: Movie) RETURN p,m\".query[Person :: Movie :: HNil].vector(driver) \"MATCH (p: Person { name: 'Charlize Theron' })-[]-&gt;(m: Movie) RETURN p,m\".query[(Person, Movie)].vector(driver) // Map. \"MATCH (p: Person { name: 'Charlize Theron' })-[]-&gt;(m: Movie) RETURN p,m\".query[(Person, Movie)].map(driver) // Any collection. \"MATCH (p: Person { name: 'Charlize Theron' })-[]-&gt;(m: Movie) RETURN p,m\".query[Person :: Movie :: HNil].collectAs(ListSet)(driver) \"MATCH (p: Person { name: 'Charlize Theron' })-[]-&gt;(m: Movie) RETURN p,m\".query[(Person, Movie)].collectAs(ListMap)(driver)"
    } ,    
    {
      "title": "Parameterized Queries",
      "url": "/neotypes/parameterized_queries.html",
      "content": "Parameterized Queries neotypes leverages StringContext for interpolating query parameters. And uses the ParameterMapper typeclass to ensure typesafety. import neotypes.implicits.syntax.cypher._ // Adds the `c` interpolator into the scope. Which can be used like this: val name = \"John\" // name: String = \"John\" val query = c\"CREATE (a: Test { name: $name })\".query[Unit] // query: neotypes.DeferredQuery[Unit] = DeferredQuery( // \"CREATE (a: Test { name: $p1 })\", // Map(\"p1\" -&gt; neotypes.types$QueryParam@23512b) // ) assert(query.query == \"CREATE (a: Test { name: $p1 })\") assert(query.params == Map(\"p1\" -&gt; neotypes.types.QueryParam(\"John\"))) All parameters will be converted to neo4j supported types (please see Supported types). The c interpolator creates a DeferredQueryBuilder which is an immutable representation of a cypher query. You can concatenate DeferredQueryBuilders with other DeferredQueryBuilders or Strings, to build complex queries. val name = \"John\" // name: String = \"John\" val born = 1980 // born: Int = 1980 val query1 = c\"CREATE (a: Test { name: $name, \" + c\"born: $born })\" // query1: neotypes.DeferredQueryBuilder = neotypes.DeferredQueryBuilder@6ffc4644 query1.query[Unit] // res2: neotypes.DeferredQuery[Unit] = DeferredQuery( // \"CREATE (a: Test { name: $p1, born: $p2 })\", // Map( // \"p1\" -&gt; neotypes.types$QueryParam@23512b, // \"p2\" -&gt; neotypes.types$QueryParam@7bc // ) // ) val LABEL = \"User\" // LABEL: String = \"User\" val query2 = c\"CREATE (a: \" + LABEL + c\"{ name: $name })\" // query2: neotypes.DeferredQueryBuilder = neotypes.DeferredQueryBuilder@6c18e80a query2.query[Unit] // res3: neotypes.DeferredQuery[Unit] = DeferredQuery( // \"CREATE (a: User { name: $p1 })\", // Map(\"p1\" -&gt; neotypes.types$QueryParam@23512b) // ) A case class can be used directly in the interpolation: import neotypes.generic.auto._ // Provides automatic derivation of ParameterMapper for any case class. // Provides automatic derivation of ParameterMapper for any case class. final case class User(name: String, born: Int) final case class Cat(tag: String) final case class HasCat(since: Int) val user = User(\"John\", 1980) // user: User = User(\"John\", 1980) val cat = Cat(\"Waffles\") // cat: Cat = Cat(\"Waffles\") val hasCat = HasCat(2010) // hasCat: HasCat = HasCat(2010) val query1 = c\"CREATE (u: User { $user })\" // query1: neotypes.DeferredQueryBuilder = neotypes.DeferredQueryBuilder@2c8848a4 query1.query[Unit] // res4: neotypes.DeferredQuery[Unit] = DeferredQuery( // \"CREATE (u: User { name: $p1, born: $p2 })\", // Map( // \"p1\" -&gt; neotypes.types$QueryParam@23512b, // \"p2\" -&gt; neotypes.types$QueryParam@7bc // ) // ) val query2 = c\"CREATE (u: User { $user })-[r: HAS_CAT { $hasCat }]-&gt;(c: Cat { $cat }) RETURN r\" // query2: neotypes.DeferredQueryBuilder = neotypes.DeferredQueryBuilder@5b083aa1 query2.query[HasCat] // res5: neotypes.DeferredQuery[HasCat] = DeferredQuery( // \"CREATE (u: User { name: $p1, born: $p2 })-[r: HAS_CAT { since: $p3 }]-&gt;(c: Cat { tag: $p4 }) RETURN r\", // Map( // \"p1\" -&gt; neotypes.types$QueryParam@23512b, // \"p2\" -&gt; neotypes.types$QueryParam@7bc, // \"p3\" -&gt; neotypes.types$QueryParam@7da, // \"p4\" -&gt; neotypes.types$QueryParam@a59194b0 // ) // )"
    } ,        
    {
      "title": "Streaming",
      "url": "/neotypes/streams.html",
      "content": "Streaming neotypes allows to stream large results by lazily consuming the result and putting elements into a stream. Currently, there are four supported implementations (one for each effect type). Akka Streams (for scala.concurrent.Future), FS2 (for cats.effect.Async[F]), Monix Observables (for monix.eval.Task) &amp; ZIO ZStreams (for zio.Task). Usage Akka Streams (neotypes-akka-stream) import akka.NotUsed import akka.actor.ActorSystem import akka.stream.scaladsl.{Sink, Source} import neotypes.{GraphDatabase, StreamingDriver} import neotypes.akkastreams.AkkaStream import neotypes.akkastreams.implicits._ // Brings the implicit Stream[AkkaStream] instance into the scope. // Brings the implicit Stream[AkkaStream] instance into the scope. import neotypes.implicits.syntax.string._ // Provides the query[T] extension method. // Provides the query[T] extension method. import org.neo4j.driver.AuthTokens import scala.concurrent.{Await, Future} import scala.concurrent.ExecutionContext.Implicits.global import scala.concurrent.duration._ implicit val system = ActorSystem(\"QuickStart\") val driver = GraphDatabase.streamingDriver[AkkaStream](\"bolt://localhost:7687\", AuthTokens.basic(\"neo4j\", \"****\")) def query(driver: StreamingDriver[AkkaStream, Future]): Source[String, NotUsed] = \"MATCH (p:Person) RETURN p.name\".query[String].stream(driver) val program: Future[Unit] = for { _ &lt;- query(driver).runWith(Sink.foreach(println)) _ &lt;- driver.close } yield () Await.ready(program, 5.seconds) FS2 (neotypes-fs2-stream) With cats.effect.IO import cats.effect.{IO, Resource} import fs2.Stream import neotypes.{GraphDatabase, StreamingDriver} import neotypes.cats.effect.implicits._ // Brings the implicit Async[IO] instance into the scope. // Brings the implicit Async[IO] instance into the scope. import neotypes.fs2.Fs2IoStream import neotypes.fs2.implicits._ // Brings the implicit Stream[Fs2IOStream] instance into the scope. // Brings the implicit Stream[Fs2IOStream] instance into the scope. import neotypes.implicits.syntax.string._ // Provides the query[T] extension method. // Provides the query[T] extension method. import org.neo4j.driver.AuthTokens implicit val cs = IO.contextShift(scala.concurrent.ExecutionContext.global) val driver: Resource[IO, StreamingDriver[Fs2IoStream, IO]] = GraphDatabase.streamingDriver[Fs2IoStream](\"bolt://localhost:7687\", AuthTokens.basic(\"neo4j\", \"****\")) val program: Stream[IO, Unit] = Stream.resource(driver).flatMap { d =&gt; \"MATCH (p:Person) RETURN p.name\" .query[String] .stream(d) .evalMap(n =&gt; IO(println(n))) } program.compile.drain.unsafeRunSync() With other effect type Basically the same code as above, but replacing IO with F (as long as there is an instance of cats.effect.Async[F]). And replacing the neotypes.fs2.Fs2IoStream type alias with neotypes.fs2.Fs2FStream[F]#T. Monix Observables (neotypes-monix-stream) import cats.effect.Resource import monix.eval.Task import monix.execution.Scheduler.Implicits.global import monix.reactive.Observable import neotypes.{GraphDatabase, StreamingDriver} import neotypes.implicits.syntax.string._ // Provides the query[T] extension method. // Provides the query[T] extension method. import neotypes.monix.implicits._ // Brings the implicit Async[Task] instance into the scope. // Brings the implicit Async[Task] instance into the scope. import neotypes.monix.stream.MonixStream import neotypes.monix.stream.implicits._ // Brings the implicit Stream[MonixStream] instance into the scope. // Brings the implicit Stream[MonixStream] instance into the scope. import org.neo4j.driver.AuthTokens import scala.concurrent.duration._ val driver: Resource[Task, StreamingDriver[MonixStream, Task]] = GraphDatabase.streamingDriver[MonixStream](\"bolt://localhost:7687\", AuthTokens.basic(\"neo4j\", \"****\")) val program: Observable[Unit] = Observable.fromResource(driver).flatMap { d =&gt; \"MATCH (p:Person) RETURN p.name\" .query[String] .stream(d) .mapEval(n =&gt; Task(println(n))) } program.completedL.runSyncUnsafe(5.seconds) ZIO ZStreams (neotypes-zio-stream) import zio.{Runtime, Managed, Task} import zio.stream.ZStream import neotypes.{GraphDatabase, StreamingDriver} import neotypes.implicits.syntax.string._ // Provides the query[T] extension method. // Provides the query[T] extension method. import neotypes.zio.implicits._ // Brings the implicit Async[Task] instance into the scope. // Brings the implicit Async[Task] instance into the scope. import neotypes.zio.stream.ZioStream import neotypes.zio.stream.implicits._ // Brings the implicit Stream[ZioStream] instance into the scope. // Brings the implicit Stream[ZioStream] instance into the scope. import org.neo4j.driver.AuthTokens val driver: Managed[Throwable, StreamingDriver[ZioStream, Task]] = GraphDatabase.streamingDriver[ZioStream](\"bolt://localhost:7687\", AuthTokens.basic(\"neo4j\", \"****\")) val program: ZStream[Any, Throwable, String] = ZStream.managed(driver).flatMap { s =&gt; \"MATCH (p:Person) RETURN p.name\" .query[String] .stream(s) } Runtime.default.unsafeRun(program.foreach(n =&gt; Task(println(n)))) Please note that the above provided type aliases are just for convenience. You can always use: Type lambdas: val driver = GraphDatabase.streamingDriver[({ type T[A] = fs2.Stream[IO, A] })#T](uri) Type Alias: type Fs2Stream[T] = fs2.Stream[IO, T] val driver = GraphDatabase.streamingDriver[Fs2Stream](uri) Kind Projector: val driver = GraphDatabase.streamingDriver[fs2.Stream[IO, ?]](uri) The code snippets above are lazily retrieving data from Neo4j, loading each element of the result only when it’s requested and commits the transaction once all elements are read. This approach aims to improve performance and memory footprint with large volumes of data. Transaction management You have two options in transaction management: Manual: if you use neotypes.Transaction and call stream, you need to ensure that the transaction is gracefully closed after reading is finished. Auto-closing: you may wish to automatically rollback the transaction once all elements are consumed. This behavior is provided by DeferredQuery.stream(StreamingDriver[S, F]) Alternative stream implementations If you don’t see your stream supported. You can add your implementation of neotypes.Stream.Aux[S[_], F[_]] typeclass. And add it to the implicit scope. The type parameters in the signature indicate: F[_] - the effect that will be used to produce each element retrieval. S[_] - the type of your stream."
    } ,    
    {
      "title": "Supported types",
      "url": "/neotypes/types.html",
      "content": "Supported types Type Query result Field of a case class Query parameter scala.Boolean ✓ ✓ ✓ scala.Int ✓ ✓ ✓ scala.Long ✓ ✓ ✓ scala.Double ✓ ✓ ✓ scala.Float ✓ ✓ ✓ java.lang.String ✓ ✓ ✓ scala.Array[Byte] ✓ ✓ ✓ scala.Option[T] * ✓ ✓ ✓ ** scala.collection._ * ✓ ✓ ✓ *** refined.Refined[T, P] * + ✓ ✓ ✓ cats.data.Chain[T] * ++ ✓ ✓ ✓ cats.data.Const[T, U] * ++ ✓ ✓ ✓ cats.data.NonEmptyChain[T] * ++ ✓ ✓ ✓ cats.data.NonEmptyList[T] * ++ ✓ ✓ ✓ cats.data.NonEmptyMap[String, T] * ++ ✓ ✓ ✓ cats.data.NonEmptySet[T] * ++ ✓ ✓ ✓ cats.data.NonEmptyVector[T] * ++ ✓ ✓ ✓ java.time.Duration ✓ ✓ ✓ java.time.LocalDate ✓ ✓ ✓ java.time.LocalDateTime ✓ ✓ ✓ java.time.LocalTime ✓ ✓ ✓ java.time.Period ✓ ✓ ✓ java.time.OffsetDateTime ✓ ✓ ✓ java.time.OffsetTime ✓ ✓ ✓ java.time.ZonedDateTime ✓ ✓ ✓ java.util.UUID ✓ ✓ ✓ org.neo4j.driver.Value ✓ ✓ ✓ org.neo4j.driver.types.IsoDuration ✓ ✓ ✓ org.neo4j.driver.types.Point ✓ ✓ ✓ org.neo4j.driver.types.Node ✓ ✓   org.neo4j.driver.types.Relationship ✓ ✓   neotypes.types.Path ✓ ✓   shapeless.HList +++ ✓ ✓ ✓ Tuple (1-22) +++ ✓ ✓ ✓ User defined case class +++ ✓ ✓ ✓ * Generic types are supported as long as the the T is also supported. ** None is converted into null. *** Map-like collections are supported only if their keys are of type String. Any other kind of tuples is not supported. + Support is provided in the neotypes-refined module. ++ Support is provided in the neotypes-cats-data module. +++ Support for automatic and semiautomatic derivation is provided in the generic module. Additional types If you want to support your own types, then you would need to create your own implicits. For fields of a case class, you need an instance of neotypes.mappers.ValueMapper[T]. You can create a new instance: From scratch by instantiating it new ValueMapper[T] { ... }. Using the helper methods on the companion object like fromCast or instance. Casting an already existing mapper using map or flatMap. For query results, you need an instance of neotypes.mappers.ResultMapper[T]. You can create a new instance: From scratch by instantiating it new ResultMapper[T] { ... }. From a ValueMapper ResultMapper.fromValueMapper[T]. Using the helper methods on the companion object like instance. Casting an already existing mapper using map or flatMap. For query parameters, you need an instance of neotypes.mappers.ParameterMapper[T]. You can create a new instance: Casting an already existing mapper using contramap. Neo4j Id Even if neo4j does not recommend the use of the of the system id, neotypes allows you to easily retrieve it. You only need to ask for a property named id on your case classes. Note: If your model also defines a custom id property, then your property will take precedence and we will return you that one instead of the system one. If you also need the system one then you can ask for the _id property. If you have a custom _id property, then yours will take precedence and the system id will be available in the id property. If you define both id and _id as custom properties, then both will take precedence and the system id would be unreachable. Disclaimer: we also discourage you from using the system id; we only allow you to access it because the Java driver does."
    }    
  ];

  idx = lunr(function () {
    this.ref("title");
    this.field("content");

    docs.forEach(function (doc) {
      this.add(doc);
    }, this);
  });

  docs.forEach(function (doc) {
    docMap.set(doc.title, doc.url);
  });
}

// The onkeypress handler for search functionality
function searchOnKeyDown(e) {
  const keyCode = e.keyCode;
  const parent = e.target.parentElement;
  const isSearchBar = e.target.id === "search-bar";
  const isSearchResult = parent ? parent.id.startsWith("result-") : false;
  const isSearchBarOrResult = isSearchBar || isSearchResult;

  if (keyCode === 40 && isSearchBarOrResult) {
    // On 'down', try to navigate down the search results
    e.preventDefault();
    e.stopPropagation();
    selectDown(e);
  } else if (keyCode === 38 && isSearchBarOrResult) {
    // On 'up', try to navigate up the search results
    e.preventDefault();
    e.stopPropagation();
    selectUp(e);
  } else if (keyCode === 27 && isSearchBarOrResult) {
    // On 'ESC', close the search dropdown
    e.preventDefault();
    e.stopPropagation();
    closeDropdownSearch(e);
  }
}

// Search is only done on key-up so that the search terms are properly propagated
function searchOnKeyUp(e) {
  // Filter out up, down, esc keys
  const keyCode = e.keyCode;
  const cannotBe = [40, 38, 27];
  const isSearchBar = e.target.id === "search-bar";
  const keyIsNotWrong = !cannotBe.includes(keyCode);
  if (isSearchBar && keyIsNotWrong) {
    // Try to run a search
    runSearch(e);
  }
}

// Move the cursor up the search list
function selectUp(e) {
  if (e.target.parentElement.id.startsWith("result-")) {
    const index = parseInt(e.target.parentElement.id.substring(7));
    if (!isNaN(index) && (index > 0)) {
      const nextIndexStr = "result-" + (index - 1);
      const querySel = "li[id$='" + nextIndexStr + "'";
      const nextResult = document.querySelector(querySel);
      if (nextResult) {
        nextResult.firstChild.focus();
      }
    }
  }
}

// Move the cursor down the search list
function selectDown(e) {
  if (e.target.id === "search-bar") {
    const firstResult = document.querySelector("li[id$='result-0']");
    if (firstResult) {
      firstResult.firstChild.focus();
    }
  } else if (e.target.parentElement.id.startsWith("result-")) {
    const index = parseInt(e.target.parentElement.id.substring(7));
    if (!isNaN(index)) {
      const nextIndexStr = "result-" + (index + 1);
      const querySel = "li[id$='" + nextIndexStr + "'";
      const nextResult = document.querySelector(querySel);
      if (nextResult) {
        nextResult.firstChild.focus();
      }
    }
  }
}

// Search for whatever the user has typed so far
function runSearch(e) {
  if (e.target.value === "") {
    // On empty string, remove all search results
    // Otherwise this may show all results as everything is a "match"
    applySearchResults([]);
  } else {
    const tokens = e.target.value.split(" ");
    const moddedTokens = tokens.map(function (token) {
      // "*" + token + "*"
      return token;
    })
    const searchTerm = moddedTokens.join(" ");
    const searchResults = idx.search(searchTerm);
    const mapResults = searchResults.map(function (result) {
      const resultUrl = docMap.get(result.ref);
      return { name: result.ref, url: resultUrl };
    })

    applySearchResults(mapResults);
  }

}

// After a search, modify the search dropdown to contain the search results
function applySearchResults(results) {
  const dropdown = document.querySelector("div[id$='search-dropdown'] > .dropdown-content.show");
  if (dropdown) {
    //Remove each child
    while (dropdown.firstChild) {
      dropdown.removeChild(dropdown.firstChild);
    }

    //Add each result as an element in the list
    results.forEach(function (result, i) {
      const elem = document.createElement("li");
      elem.setAttribute("class", "dropdown-item");
      elem.setAttribute("id", "result-" + i);

      const elemLink = document.createElement("a");
      elemLink.setAttribute("title", result.name);
      elemLink.setAttribute("href", result.url);
      elemLink.setAttribute("class", "dropdown-item-link");

      const elemLinkText = document.createElement("span");
      elemLinkText.setAttribute("class", "dropdown-item-link-text");
      elemLinkText.innerHTML = result.name;

      elemLink.appendChild(elemLinkText);
      elem.appendChild(elemLink);
      dropdown.appendChild(elem);
    });
  }
}

// Close the dropdown if the user clicks (only) outside of it
function closeDropdownSearch(e) {
  // Check if where we're clicking is the search dropdown
  if (e.target.id !== "search-bar") {
    const dropdown = document.querySelector("div[id$='search-dropdown'] > .dropdown-content.show");
    if (dropdown) {
      dropdown.classList.remove("show");
      document.documentElement.removeEventListener("click", closeDropdownSearch);
    }
  }
}
