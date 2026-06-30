export const JAVA_LESSONS = [
  {
    id: 1,
    slug: 'jdbc-fundamentals',
    title: 'JDBC Fundamentals',
    difficulty: 'Intermediate',
    duration: '60 mins',
    xp: 200,
    accent: '#3B82F6',
    icon: '🔌',
    description: 'Learn the core JDBC architecture, driver models, connections, statements, PreparedStatements, and handling ResultSets.',
    topics: ['JDBC Architecture', 'Driver Types', 'Connection', 'Statement', 'PreparedStatement', 'ResultSet'],
    architectExplain: {
      whyCompaniesUseIt: "Direct control over database operations, high execution performance, and database portability using standardized drivers.",
      scalabilityImpact: "Direct statement execution can create database bottlenecks if connections are not pooled. Statement caching and PreparedStatement reuse are vital.",
      performanceImpact: "PreparedStatements prevent syntax parsing overhead on subsequent executions. Batching statements reduces network round trips.",
      realWorldExamples: "Enterprise connection pools (like HikariCP) wrap standard JDBC drivers to provide high-concurrency access in Spring/Hibernate apps.",
      decisions: "Always use PreparedStatements to prevent SQL Injection. Configure optimal fetch sizes on ResultSets to prevent OutOfMemory errors."
    },
    script: [
      { type: 'intro', text: "Welcome to JDBC Fundamentals. JDBC, or Java Database Connectivity, is the foundational technology that allows Java programs to interact with relational databases." },
      { type: 'concept', text: "The JDBC architecture consists of two layers: the JDBC API (application level) and the JDBC Driver API (driver level). Drivers translate Java calls into native SQL commands." },
      { type: 'code', text: "Here is how to create a basic connection using the DriverManager and execute a query. Notice that resource clean-up is done automatically using Java's Try-With-Resources block." },
      { type: 'warn', text: "Critical Warning: Never concatenate user inputs directly into SQL strings. This makes you vulnerable to SQL injection. Always use PreparedStatement with placeholders instead." },
      { type: 'concept', text: "ResultSets hold the tabular data returned by queries. Iterate through them using rs.next() and fetch values using typed getters like getString() or getInt()." },
      { type: 'quiz', text: "Quick Check! Which interface should you use to prevent SQL injection attacks in Java?" },
      { type: 'congrats', text: "Superb! You have completed JDBC Fundamentals. Now you know how database drivers, connections, statements, and ResultSets behave." },
      { type: 'summary', text: "In this module, we covered: JDBC Architecture, Driver types, Connection objects, Statements vs PreparedStatements, and ResultSet iteration." }
    ],
    codeExamples: [
      {
        title: 'Connection & Query',
        code: `import java.sql.*;

public class JdbcDemo {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/eduverse";
        String user = "root";
        String password = "password";
        
        String query = "SELECT id, name FROM students WHERE gpa >= ?";
        
        try (Connection conn = DriverManager.getConnection(url, user, password);
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            
            pstmt.setDouble(1, 9.0);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    System.out.println("ID: " + rs.getInt("id") + ", Name: " + rs.getString("name"));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}`,
        explanation: 'Uses Try-With-Resources to guarantee that Connection, PreparedStatement, and ResultSet are closed correctly, avoiding leaks.',
        output: 'ID: 101, Name: John Doe\nID: 105, Name: Sarah Jenkins'
      }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'Which JDBC driver type is known as the Native-API driver?', options: ['Type 1', 'Type 2', 'Type 3', 'Type 4'], correct: 'Type 2', explanation: 'Type 2 driver uses JNI to call database client libraries.' },
        { id: 'q2', question: 'What does Type 4 driver represent?', options: ['JDBC-ODBC bridge', 'Native-API driver', 'Network-Protocol driver', 'Thin/Pure Java driver'], correct: 'Thin/Pure Java driver', explanation: 'Type 4 drivers convert JDBC calls directly into vendor-specific database protocols using pure Java.' },
        { id: 'q3', question: 'Which interface represents precompiled SQL statements?', options: ['Statement', 'PreparedStatement', 'CallableStatement', 'DatabaseMetaData'], correct: 'PreparedStatement', explanation: 'PreparedStatement precompiles SQL commands on the server to improve speed and secure inputs.' },
        { id: 'q4', question: 'Which JDBC method returns an auto-generated key?', options: ['pstmt.getGeneratedKeys()', 'pstmt.getAutoKeys()', 'conn.getKeys()', 'rs.getLastId()'], correct: 'pstmt.getGeneratedKeys()', explanation: 'getGeneratedKeys() retrieves auto-incremented database identifiers.' },
        { id: 'q5', question: 'How is a SQLException handled properly in JDBC?', options: ['Ignore it', 'Catch and close resources', 'Wrap in RuntimeException and print details', 'Let JVM crash'], correct: 'Wrap in RuntimeException and print details', explanation: 'Always print stack traces and clean up system resources to avoid leaking DB connections.' },
        { id: 'q6', question: 'What is the default auto-commit mode for a new JDBC connection?', options: ['false', 'true', 'depends on database', 'depends on driver'], correct: 'true', explanation: 'DriverManager connection defaults to auto-commit = true.' },
        { id: 'q7', question: 'Which class is used to load and register drivers dynamically in older JDBC systems?', options: ['DriverManager', 'Class.forName()', 'Driver', 'Connection'], correct: 'Class.forName()', explanation: 'Class.forName("driver_name") dynamically loads driver classes into VM memory.' },
        { id: 'q8', question: 'Which JDBC object provides metadata about database properties?', options: ['ResultSetMetaData', 'DatabaseMetaData', 'StatementMetaData', 'ConnectionMetaData'], correct: 'DatabaseMetaData', explanation: 'DatabaseMetaData contains information about database products, version, and schemas.' },
        { id: 'q9', question: 'Which ResultSet concurrency mode allows updates to tables?', options: ['CONCUR_READ_ONLY', 'CONCUR_UPDATABLE', 'TYPE_SCROLL_INSENSITIVE', 'TYPE_FORWARD_ONLY'], correct: 'CONCUR_UPDATABLE', explanation: 'CONCUR_UPDATABLE lets developers update base database rows through ResultSets.' },
        { id: 'q10', question: 'What is the main advantage of connection pooling?', options: ['Better security', 'Eliminating query parsing', 'Reusing active connections to avoid handshake costs', 'Increasing buffer pool sizes'], correct: 'Reusing active connections to avoid handshake costs', explanation: 'Pooling avoids repeating expensive TCP connections and credential exchanges.' }
      ],
      coding: [
        {
          id: 'c1',
          title: 'Secure Parameter Statement',
          description: 'Construct a PreparedStatement query to find an employee by their ID and set the parameter.',
          starterCode: `import java.sql.*;

public class Finder {
    public static void printEmployee(Connection conn, int id) throws SQLException {
        String sql = "SELECT * FROM employees WHERE id = ?";
        // TODO: Prepare, set parameter, execute, and print name
    }
}`,
          solution: `import java.sql.*;

public class Finder {
    public static void printEmployee(Connection conn, int id) throws SQLException {
        String sql = "SELECT * FROM employees WHERE id = ?";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    System.out.println(rs.getString("name"));
                }
            }
        }
    }
}`
        },
        {
          id: 'c2',
          title: 'Batch Update Handler',
          description: 'Add multiple insert queries to a PreparedStatement batch and execute them.',
          starterCode: `import java.sql.*;

public class Batcher {
    public static void insertBatch(Connection conn, String[] names) throws SQLException {
        String sql = "INSERT INTO users (name) VALUES (?)";
        // TODO: Loop names, add to batch, execute batch
    }
}`,
          solution: `import java.sql.*;

public class Batcher {
    public static void insertBatch(Connection conn, String[] names) throws SQLException {
        String sql = "INSERT INTO users (name) VALUES (?)";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            for (String name : names) {
                pstmt.setString(1, name);
                pstmt.addBatch();
            }
            pstmt.executeBatch();
        }
    }
}`
        },
        {
          id: 'c3',
          title: 'Transaction Manager',
          description: 'Implement a double transfer transaction: subtract amount from source, add to target, handling failures.',
          starterCode: `import java.sql.*;

public class TxManager {
    public static void transfer(Connection conn, int src, int dest, double amount) throws SQLException {
        // TODO: disable auto-commit, update accounts, commit, rollback on exception
    }
}`,
          solution: `import java.sql.*;

public class TxManager {
    public static void transfer(Connection conn, int src, int dest, double amount) throws SQLException {
        try {
            conn.setAutoCommit(false);
            try (PreparedStatement dec = conn.prepareStatement("UPDATE accounts SET balance = balance - ? WHERE id = ?");
                 PreparedStatement inc = conn.prepareStatement("UPDATE accounts SET balance = balance + ? WHERE id = ?")) {
                dec.setDouble(1, amount);
                dec.setInt(2, src);
                dec.executeUpdate();
                
                inc.setDouble(1, amount);
                inc.setInt(2, dest);
                inc.executeUpdate();
            }
            conn.commit();
        } catch (SQLException e) {
            conn.rollback();
            throw e;
        } finally {
            conn.setAutoCommit(true);
        }
    }
}`
        }
      ],
      scenario: [
        {
          id: 's1',
          question: "Your team discovers that under heavy load, the application logs say 'HikariPool-1 - Connection is not available, request timed out'. How do you resolve this architectural issue?",
          hint: "Think about connection leakages, try-with-resources blocks, and maximum pool limit settings.",
          explanation: "Ensure that all connections, statements, and ResultSets are closed correctly using Try-With-Resources. Check if the connection pool size is too small for the volume of parallel threads and increase the maximum pool limit."
        },
        {
          id: 's2',
          question: "A penetration tester reports that your login query `SELECT * FROM users WHERE email = '` + email + `' AND pass = '` + pass + `'` is prone to SQL Injection. Detail your remediation.",
          hint: "How do parameter placeholders and server-side compilation resolve this vulnerability?",
          explanation: "Change the query to use positional parameters: `SELECT * FROM users WHERE email = ? AND pass = ?`. Instantiate the command as a PreparedStatement and bind strings via `.setString()`. This ensures input values are treated strictly as parameters, preventing structural SQL injection."
        }
      ]
    },
    summary: "JDBC serves as the underlying bridge to connect databases. Understanding PreparedStatements, correct resource disposal, and transaction isolation is key to developing reliable Enterprise Java applications."
  },
  {
    id: 2,
    slug: 'servlets',
    title: 'Servlets',
    difficulty: 'Intermediate',
    duration: '70 mins',
    xp: 250,
    accent: '#8B5CF6',
    icon: '⚙️',
    description: 'Learn HTTP request processing, the servlet container lifecycle, session tracking, and cookies.',
    topics: ['Servlet Lifecycle', 'Request Handling', 'Response Handling', 'Session Tracking', 'Cookies'],
    architectExplain: {
      whyCompaniesUseIt: "Servlets form the backend foundation for web MVC. They process incoming HTTP requests and format dynamic text responses.",
      scalabilityImpact: "Servlets are run as multi-threaded singletons. A single instance handles all parallel requests. Instance fields must never contain request-specific state.",
      performanceImpact: "Lightweight request handlers. Servlet filters can intercept requests early, performing auth or caching without hitting business controllers.",
      realWorldExamples: "Spring MVC's DispatcherServlet is a front-controller servlet that manages all request mappings in modern Spring web apps.",
      decisions: "Never store state in servlet class instance variables. Configure appropriate session timeouts to prevent JVM heap exhaustion."
    },
    script: [
      { type: 'intro', text: "Welcome to Servlets. A Servlet is a Java class that extends the capabilities of servers that host applications accessed via a request-response model." },
      { type: 'concept', text: "The Servlet container controls the lifecycle: init() initializes, service() directs to doGet() or doPost(), and destroy() cleans up." },
      { type: 'code', text: "Take a look at this basic Servlet implementation. We extend HttpServlet, read parameters from HttpServletRequest, and write to HttpServletResponse." },
      { type: 'warn', text: "Warning: Servlets are singletons! Sharing mutable instance variables in a servlet will create critical thread-safety bugs under concurrent load." },
      { type: 'quiz', text: "Quick Check! Which method gets called exactly once during a servlet's lifetime when it is first instantiated?" },
      { type: 'summary', text: "You have mastered Servlets! You now understand HTTP request handling, session states, and why servlet instances must be thread-safe." }
    ],
    codeExamples: [
      {
        title: 'Basic Servlet',
        code: `import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;

@WebServlet("/greet")
public class HelloServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        String name = req.getParameter("name");
        if (name == null) name = "Guest";
        
        resp.setContentType("text/html");
        PrintWriter out = resp.getWriter();
        out.println("<h1>Hello, " + name + "!</h1>");
    }
}`,
        explanation: '@WebServlet maps the request path to this servlet class. doGet handles standard HTTP GET operations.',
        output: 'HTML output: <h1>Hello, Guest!</h1>'
      }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'Which package contains the servlet classes?', options: ['java.net', 'javax.servlet', 'java.servlet.web', 'javax.web'], correct: 'javax.servlet', explanation: 'Standard servlet interfaces live under javax.servlet and javax.servlet.http namespaces.' },
        { id: 'q2', question: 'How many instances of a specific servlet are created by default in a container?', options: ['One per request', 'One per session', 'Exactly one singleton instance', 'Unlimited'], correct: 'Exactly one singleton instance', explanation: 'The servlet engine instantiates only one servlet object, executing request service loops in parallel threads.' },
        { id: 'q3', question: 'Which method handles request dispatching?', options: ['doGet', 'service', 'init', 'destroy'], correct: 'service', explanation: 'The service() method coordinates the HTTP request, delegating to doGet, doPost, etc.' },
        { id: 'q4', question: 'How do you get a session object?', options: ['new HttpSession()', 'req.getSession()', 'resp.getSession()', 'Session.getInstance()'], correct: 'req.getSession()', explanation: 'getSession() returns or creates a session context linked to the client HTTP headers.' },
        { id: 'q5', question: 'Which class redirects a client to a new URL?', options: ['RequestDispatcher', 'HttpServletResponse', 'ServletContext', 'HttpServletRequest'], correct: 'HttpServletResponse', explanation: 'response.sendRedirect(url) sends a 302 HTTP status redirecting browser clients.' },
        { id: 'q6', question: 'What is the purpose of ServletConfig?', options: ['Store global configuration parameters', 'Store servlet-specific init parameters', 'Manage session tracking', 'Route JDBC queries'], correct: 'Store servlet-specific init parameters', explanation: 'ServletConfig stores specific parameters that are configured only for that single servlet.' },
        { id: 'q7', question: 'What is the purpose of ServletContext?', options: ['Store global configuration parameters', 'Store servlet-specific parameters', 'Log SQL database logs', 'Manage TCP handshake parameters'], correct: 'Store global configuration parameters', explanation: 'ServletContext is shared across all servlets in the entire web deployment.' },
        { id: 'q8', question: 'Which method forward request parameters from servlet to JSP internally?', options: ['dispatcher.forward()', 'dispatcher.include()', 'response.sendRedirect()', 'request.redirect()'], correct: 'dispatcher.forward()', explanation: 'dispatcher.forward() routes request data on the server side without notifying the client.' },
        { id: 'q9', question: 'How do cookies store state?', options: ['Database records', 'JVM heap space', 'Text files in user browsers', 'Session parameters'], correct: 'Text files in user browsers', explanation: 'Cookies write key-value string records onto browser clients sent with HTTP headers.' },
        { id: 'q10', question: 'Which annotation registers a servlet class path?', options: ['@Servlet', '@WebEndpoint', '@WebServlet', '@Controller'], correct: '@WebServlet', explanation: '@WebServlet declares URI mappings inside modern Servlet 3.0+ APIs.' }
      ],
      coding: [
        {
          id: 'c1',
          title: 'Cookie Generator',
          description: 'Create a cookie named "user_token" with value "secret123" and add it to the HTTP response.',
          starterCode: `import javax.servlet.http.*;

public class CookieCreator {
    public void generateCookie(HttpServletResponse resp) {
        // TODO: Create a Cookie object and add it to the response
    }
}`,
          solution: `import javax.servlet.http.*;

public class CookieCreator {
    public void generateCookie(HttpServletResponse resp) {
        Cookie c = new Cookie("user_token", "secret123");
        c.setMaxAge(3600); // 1 hour
        resp.addCookie(c);
    }
}`
        },
        {
          id: 'c2',
          title: 'Session Attribute Binder',
          description: 'Retrieve the HttpSession from the request and set an attribute named "cart_count" to 5.',
          starterCode: `import javax.servlet.http.*;

public class SessionBinder {
    public void bindCart(HttpServletRequest req) {
        // TODO: Retrieve session and set cart_count attribute
    }
}`,
          solution: `import javax.servlet.http.*;

public class SessionBinder {
    public void bindCart(HttpServletRequest req) {
        HttpSession session = req.getSession(true);
        session.setAttribute("cart_count", 5);
    }
}`
        },
        {
          id: 'c3',
          title: 'Servlet Redirection Filter',
          description: 'If request parameter "auth" is false, forward the request to "/login.jsp". Otherwise forward to "/dashboard.jsp".',
          starterCode: `import java.io.IOException;
import javax.servlet.*;
import javax.servlet.http.*;

public class RouterFilter {
    public void route(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // TODO: Check auth param, forward appropriately
    }
}`,
          solution: `import java.io.IOException;
import javax.servlet.*;
import javax.servlet.http.*;

public class RouterFilter {
    public void route(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String auth = req.getParameter("auth");
        if ("false".equals(auth) || auth == null) {
            req.getRequestDispatcher("/login.jsp").forward(req, resp);
        } else {
            req.getRequestDispatcher("/dashboard.jsp").forward(req, resp);
        }
    }
}`
        }
      ],
      scenario: [
        {
          id: 's1',
          question: "An engineer adds a mutable `private int requestCounter = 0;` inside a Servlet class and increments it inside `doGet`. Why is this dangerous in production, and how do you resolve it?",
          hint: "Think about multiple threads accessing this singleton instance simultaneously.",
          explanation: "Because servlets are singletons, concurrent requests run in separate threads concurrently incrementing the counter. This creates thread contention and race conditions. Resolve this by declaring counter parameters locally inside methods or wrapping it inside atomic references like AtomicInteger."
        },
        {
          id: 's2',
          question: "You want to implement a custom authentication filter that checks if the request header contains a valid Authorization token before hitting any Servlet. Where do you place this in the Java architecture?",
          hint: "What component acts as an interceptor in the Servlet pipeline?",
          explanation: "Implement the javax.servlet.Filter interface and define the check in the doFilter() method. Bind this filter to intercepts URLs like '/*' inside web.xml or using @WebFilter annotations. If authentication fails, block downstream processing by avoiding calling filterChain.doFilter()."
        }
      ]
    },
    summary: "Servlets provide the foundation for web requests. Understanding their singleton nature and lifecycle is crucial for handling HTTP protocols correctly."
  },
  {
    id: 3,
    slug: 'jsp',
    title: 'JSP',
    difficulty: 'Intermediate',
    duration: '65 mins',
    xp: 250,
    accent: '#10B981',
    icon: '📄',
    description: 'Learn JSP scripting elements, directives, action tags, JSTL templates, and MVC development pattern.',
    topics: ['JSP Basics', 'Directives', 'Expression Tags', 'JSTL', 'MVC Integration'],
    architectExplain: {
      whyCompaniesUseIt: "Provides a quick way to mix static HTML markup with dynamic Java data on the server side.",
      scalabilityImpact: "JSP pages get translated into Java servlet source code and compiled to class files upon the first request. Can create latency spikes during hot-reloads.",
      performanceImpact: "Compiled class files are executed in the JVM. Caching JSP page output fragments is key for rendering complex elements efficiently.",
      realWorldExamples: "Enterprise legacy portals or admin panels render model attributes from controllers using JSTL tags to feed grids.",
      decisions: "Avoid writing Java scriptlets inside JSP files. Keep views declarative using JSP Expression Language (EL) and JSTL tags."
    },
    script: [
      { type: 'intro', text: "Welcome to JSP (JavaServer Pages). JSP allows developers to write dynamic HTML templates that combine static markup with Java code blocks." },
      { type: 'concept', text: "JSP utilizes tags for structure: Directives (<%@ %>) configure settings, Scripts (<% %>) execute Java snippets, and Expression tags (<%= %>) print values." },
      { type: 'code', text: "Look at this JSTL list template. We avoid scriptlets by using <c:forEach> to iterate through lists passed from servlets." },
      { type: 'warn', text: "Avoid putting database logic or calculations in JSPs. JSPs should strictly behave as view templates under the MVC paradigm." },
      { type: 'quiz', text: "Which tag is used to write comments in JSP files?" },
      { type: 'summary', text: "Well done! You have completed JSP basics. You now know how compile stages convert JSPs into servlet classes dynamically." }
    ],
    codeExamples: [
      {
        title: 'JSTL Templating',
        code: `<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<html>
<head><title>Students</title></head>
<body>
    <h2>Active Students:</h2>
    <ul>
        <c:forEach var="std" items="\${studentList}">
            <li>\${std.name} - GPA: \${std.gpa}</li>
        </c:forEach>
    </ul>
</body>
</html>`,
        explanation: 'JSTL tags like <c:forEach> clean up UI templates by replacing raw Java scriptlet loop syntax with clear markup tags.',
        output: 'Outputs an HTML list elements with dynamically rendered student details.'
      }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'What does a JSP page convert into during runtime execution?', options: ['Static HTML file', 'Standard Java Servlet', 'JSON response payload', 'XML structure'], correct: 'Standard Java Servlet', explanation: 'The servlet engine parses and translates JSPs into standard Java Servlets compiled inside target folders.' },
        { id: 'q2', question: 'Which syntax defines a JSP page directive?', options: ['<%! %>', '<%@ %>', '<%= %>', '<% %>'], correct: '<%@ %>', explanation: 'Directives define page parameters, imported packages, or tag libraries.' },
        { id: 'q3', question: 'Which JSP tag prints a computed value directly to the response writer?', options: ['Scriptlet', 'Directive', 'Expression', 'Declaration'], correct: 'Expression', explanation: 'JSP Expression (<%= expr %>) resolves code values and appends them to response streams.' },
        { id: 'q4', question: 'What prefix represents standard JSTL core tags by convention?', options: ['x', 'sql', 'c', 'fn'], correct: 'c', explanation: 'Core JSTL tags (forEach, if, out) use the c namespace prefix.' },
        { id: 'q5', question: 'Which JSP implicit object references the current servlet session?', options: ['request', 'response', 'session', 'application'], correct: 'session', explanation: 'The session object is implicitly provided to JSPs unless page sessions are disabled.' },
        { id: 'q6', question: 'How is Expression Language (EL) marked in JSP?', options: ['#{expr}', '${expr}', '<%=expr%>', '<%expr%>'], correct: '${expr}', explanation: '${expr} triggers Expression Language resolving bean attributes dynamically.' },
        { id: 'q7', question: 'What action tag instantiates a Java Bean in JSP?', options: ['<jsp:useBean>', '<jsp:setProperty>', '<jsp:getProperty>', '<jsp:include>'], correct: '<jsp:useBean>', explanation: '<jsp:useBean> binds or creates standard Java objects inside scopes.' },
        { id: 'q8', question: 'Which directive imports classes into JSP files?', options: ['include', 'page', 'taglib', 'import'], correct: 'page', explanation: '<%@ page import="java.util.*" %> imports external packages.' },
        { id: 'q9', question: 'What is a drawback of using scriptlets inside JSP views?', options: ['Reduces page loading speed', 'Violates separation of concerns, making debugging hard', 'Bypasses compiling logic', 'Prevents JDBC queries'], correct: 'Violates separation of concerns, making debugging hard', explanation: 'Scriptlets mix backend code with HTML, making layout updates error-prone and hard to maintain.' },
        { id: 'q10', question: 'What lifecycle method initializes a JSP page?', options: ['jspInit()', '_jspService()', 'jspDestroy()', 'init()'], correct: 'jspInit()', explanation: 'jspInit() is executed when compiling translation stages complete.' }
      ],
      coding: [
        {
          id: 'c1',
          title: 'EL Evaluator',
          description: 'Write an Expression Language statement that extracts the "username" attribute from the session scope.',
          starterCode: `<!-- TODO: Render username using Expression Language -->
<p>Welcome, </p>`,
          solution: `<!-- TODO: Render username using Expression Language -->
<p>Welcome, \${sessionScope.username}</p>`
        },
        {
          id: 'c2',
          title: 'JSTL Conditional Builder',
          description: 'Use the JSTL <c:if> tag to display a warning div if the attribute "gpa" is less than 5.0.',
          starterCode: `<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!-- TODO: Add conditional warning -->
`,
          solution: `<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<c:if test="\${gpa < 5.0}">
    <div class="warn">Warning: Under-performing GPA</div>
</c:if>`
        },
        {
          id: 'c3',
          title: 'JSP Import Declaration',
          description: 'Add a page directive at the top of the file importing java.util.List and java.util.ArrayList.',
          starterCode: `<!-- TODO: Add page import directive -->
<html>`,
          solution: `<%@ page import="java.util.List, java.util.ArrayList" %>
<html>`
        }
      ],
      scenario: [
        {
          id: 's1',
          question: "An application shows database connection credentials hardcoded inside JSP scriptlet tags. What architectural design pattern does this violate, and how do you fix it?",
          hint: "Think about the role of the View in MVC architectures.",
          explanation: "It violates MVC design separation. JSPs represent views and should never retrieve connections. Shift data access logic to DAO layers, invoke them inside controllers (Servlets), and forward result attributes to JSPs to render."
        },
        {
          id: 's2',
          question: "You need to display a formatted date based on the user's browser locale inside a JSP view. How do you implement this in a clean way?",
          hint: "Which JSTL tag library handles localizations and formatting?",
          explanation: "Import the JSTL formatting library: `<%@ taglib prefix='fmt' uri='http://java.sun.com/jsp/jstl/fmt' %>`. Use `<fmt:formatDate value='${currentDate}' type='date' />` tags to automatically scale formats to localized scopes."
        }
      ]
    },
    summary: "JSPs translate layout structures into Servlets. Employing Expression Language and JSTL library elements keeps code clean and decouples interface structures from business engines."
  },
  {
    id: 4,
    slug: 'session-management',
    title: 'Session Management',
    difficulty: 'Intermediate',
    duration: '45 mins',
    xp: 150,
    accent: '#EC4899',
    icon: '🍪',
    description: 'Learn standard session tracking models including cookies, URL rewriting, hidden form fields, and HttpSession.',
    topics: ['Cookies', 'URL Rewriting', 'Hidden Fields', 'HttpSession'],
    architectExplain: {
      whyCompaniesUseIt: "Maintains conversational states across multiple stateless HTTP requests for user interactions.",
      scalabilityImpact: "In-memory JVM sessions create sticky session requirements on load balancers. Session clustering or distributed sessions (using Redis) are required for scale.",
      performanceImpact: "Storing large object graphs in HttpSession consumes heaps, leading to GC pauses and memory bottlenecks under high traffic.",
      realWorldExamples: "Spring Session abstracting Servlet sessions to sync attributes to centralized Redis instances across multiple backend microservices.",
      decisions: "Set session cookies as HttpOnly and Secure. Never store passwords or database entities directly in session scopes."
    },
    script: [
      { type: 'intro', text: "Welcome to Session Management. Because HTTP is a stateless protocol, servers cannot identify subsequent requests from the same user without session tracking." },
      { type: 'concept', text: "There are four main mechanisms to track sessions: Cookies, URL Rewriting, Hidden Form Fields, and the HttpServlet container HttpSession API." },
      { type: 'code', text: "Let's check this session lifecycle controller. We store key objects in HttpSession, set invalidation parameters, and read attributes across requests." },
      { type: 'warn', text: "Security Warning: Always mark session cookies as HttpOnly to protect them from Cross-Site Scripting (XSS) script theft." },
      { type: 'quiz', text: "What is the typical cookie name used by Java servlet containers to track sessions?" },
      { type: 'summary', text: "Excellent! You understand session track patterns, cookies, URL serialization methods, and clustering architectures." }
    ],
    codeExamples: [
      {
        title: 'HttpSession Lifecycle',
        code: `import java.io.IOException;
import javax.servlet.http.*;

public class SessionController extends HttpServlet {
    public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession session = req.getSession(true); // create if not exists
        
        session.setAttribute("user_role", "admin");
        session.setMaxInactiveInterval(1800); // 30 minutes
        
        // Invalidation example
        // session.invalidate();
        
        resp.getWriter().write("Session configured. Timeout: " + session.getMaxInactiveInterval() + "s");
    }
}`,
        explanation: 'req.getSession(true) links the user requests to their session database. Invalidate terminates active sessions.',
        output: 'Session configured. Timeout: 1800s'
      }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'Which tracking mechanism appends session IDs to hyperlinks?', options: ['Cookies', 'URL Rewriting', 'Hidden Fields', 'HttpSession'], correct: 'URL Rewriting', explanation: 'URL Rewriting encodes session keys into the URL query path for cookie-disabled environments.' },
        { id: 'q2', question: 'What is the default cookie name used by Java engines for session tracking?', options: ['PHPSESSID', 'JSESSIONID', 'ASPSESSIONID', 'JAVA_SESSION_ID'], correct: 'JSESSIONID', explanation: 'J2EE servlet containers write and identify JSESSIONID cookies to match clients.' },
        { id: 'q3', question: 'What happens when a session times out?', options: ['Server crashes', 'JVM deletes all session attributes and garbage-collects objects', 'Database deletes rows', 'Cookies get deleted on browser immediately'], correct: 'JVM deletes all session attributes and garbage-collects objects', explanation: 'Session timeouts trigger container invalidation, deleting in-memory maps.' },
        { id: 'q4', question: 'Which cookie attribute prevents client scripts from reading session cookies?', options: ['Secure', 'Domain', 'Path', 'HttpOnly'], correct: 'HttpOnly', explanation: 'HttpOnly prevents JavaScript scripts from reading cookie keys via document.cookie.' },
        { id: 'q5', question: 'Where is session data stored when using standard in-memory session tracking?', options: ['Client storage', 'Web server JVM heap', 'MySQL database', 'Client browser cookies'], correct: 'Web server JVM heap', explanation: 'HttpSession data sits in memory in the JVM heap space of the servlet host.' },
        { id: 'q6', question: 'What method invalidates a session?', options: ['session.close()', 'session.destroy()', 'session.invalidate()', 'session.clear()'], correct: 'session.invalidate()', explanation: 'invalidate() detaches and clears current session instances.' },
        { id: 'q7', question: 'Which mechanism is recommended for cookie-disabled environments?', options: ['URL Rewriting', 'HTML Hidden fields', 'Local Storage', 'Session Filters'], correct: 'URL Rewriting', explanation: 'URL Rewriting encodes session keys dynamically to ensure navigation retains state.' },
        { id: 'q8', question: 'How can you configure session timeout globally in web.xml?', options: ['<session-timeout>', '<session-config><session-timeout>30</session-timeout></session-config>', '<timeout-val>', '<session-expire>'], correct: '<session-config><session-timeout>30</session-timeout></session-config>', explanation: 'Configure timeouts globally inside web.xml tags in minutes.' },
        { id: 'q9', question: 'What represents the hidden field mechanism?', options: ['URL parameters', '<input type="hidden"> tags inside forms', 'Cookies with max age 0', 'CSS hidden layers'], correct: '<input type="hidden"> tags inside forms', explanation: 'Hidden form parameters submit session tokens only during form submissions.' },
        { id: 'q10', question: 'What issue occurs when scaling in-memory sessions across multi-node servers?', options: ['Database lock failures', 'Sessions are lost if load balancer routes users to different nodes without session replication', 'JVM ClassNotFoundException', 'Network timeouts'], correct: 'Sessions are lost if load balancer routes users to different nodes without session replication', explanation: 'Stateless servers need sticky routing or shared databases to access in-memory session pools.' }
      ],
      coding: [
        {
          id: 'c1',
          title: 'URL Rewriter',
          description: 'Encode the target URL string "/checkout" with the session ID using HttpServletResponse.',
          starterCode: `import javax.servlet.http.*;

public class Encoder {
    public String encodePath(HttpServletResponse resp, String path) {
        // TODO: encode the path URL and return it
        return null;
    }
}`,
          solution: `import javax.servlet.http.*;

public class Encoder {
    public String encodePath(HttpServletResponse resp, String path) {
        return resp.encodeURL(path);
    }
}`
        },
        {
          id: 'c2',
          title: 'Secure Session Attributes',
          description: 'Check if user role is null, if so invalidate the session. Else refresh lifetime to 1 hour.',
          starterCode: `import javax.servlet.http.*;

public class SessionSecurity {
    public void secureSession(HttpSession session) {
        // TODO: check user_role, invalidate or set timeout
    }
}`,
          solution: `import javax.servlet.http.*;

public class SessionSecurity {
    public void secureSession(HttpSession session) {
        String role = (String) session.getAttribute("user_role");
        if (role == null) {
            session.invalidate();
        } else {
            session.setMaxInactiveInterval(3600);
        }
    }
}`
        },
        {
          id: 'c3',
          title: 'Hidden Field Builder',
          description: 'Construct an HTML hidden input string containing the token name and value.',
          starterCode: `public class FormBuilder {
    public String buildHiddenField(String name, String tokenVal) {
        // TODO: Return HTML hidden input string
        return null;
    }
}`,
          solution: `public class FormBuilder {
    public String buildHiddenField(String name, String tokenVal) {
        return "<input type=\\"hidden\\" name=\\"" + name + "\\" value=\\"" + tokenVal + "\\" />";
    }
}`
        }
      ],
      scenario: [
        {
          id: 's1',
          question: "An application deployed on a cluster of three Tomcat instances keeps logging out users randomly. How do you diagnose and fix this session tracking issue?",
          hint: "What happens when a load balancer routes requests to different server instances?",
          explanation: "Since sessions are in-memory, requests routed to another node don't have access to the session details. Implement sticky sessions at the load balancer level, or configure Tomcat session replication, or use Spring Session Redis to share state."
        },
        {
          id: 's2',
          question: "An application audit reveals that session hijacking is possible because session IDs are transmitted over plain HTTP URLs. How do you secure session tracking?",
          hint: "Which attributes should be configured for the cookie?",
          explanation: "Force the application to run over HTTPS. Configure the session cookies with the Secure and HttpOnly flags. Avoid putting the JSESSIONID in the URL, disabling URL rewriting if necessary."
        }
      ]
    },
    summary: "Session tracking maintains user state across stateless requests. Secure cookies, session timeouts, and external database stores form the core of enterprise security architectures."
  },
  {
    id: 5,
    slug: 'java-beans',
    title: 'Java Beans',
    difficulty: 'Intermediate',
    duration: '40 mins',
    xp: 120,
    accent: '#F59E0B',
    icon: '☕',
    description: 'Learn JavaBean conventions, serialization, getters & setters, reusability, and MVC architecture.',
    topics: ['Bean Properties', 'Getters & Setters', 'Reusability', 'MVC Usage'],
    architectExplain: {
      whyCompaniesUseIt: "Encapsulates multiple objects into a single standardized bean object, ensuring clean portability and reuse.",
      scalabilityImpact: "Beans act as data transfer structures. They must be lightweight and serializable to cross network boundaries in distributed systems.",
      performanceImpact: "Reflection calls during serialization/deserialization have a small CPU footprint. Restrict deep nesting inside dynamic serialization graphs.",
      realWorldExamples: "DTOs (Data Transfer Objects) and Entity classes in JPA are built following standard JavaBean rules.",
      decisions: "Make sure your JavaBean implements java.io.Serializable. Always define a public zero-argument constructor."
    },
    script: [
      { type: 'intro', text: "Welcome to Java Beans. A JavaBean is a portable, reusable software component that follows specific design conventions." },
      { type: 'concept', text: "JavaBean rules are simple: it must have a public default constructor, implement Serializable, and provide getters/setters for properties." },
      { type: 'code', text: "Here is a standard Student JavaBean. It encapsulates data fields, exposes accessor methods, and supports standard serialization." },
      { type: 'warn', text: "Remember: If you define a constructor with parameters, the compiler will not generate the default constructor. You must add the zero-arg constructor manually." },
      { type: 'quiz', text: "Which interface must a JavaBean implement to allow it to be serialized into a byte stream?" },
      { type: 'summary', text: "Great! You understand JavaBeans, accessor standards, MVC encapsulation, and data serialization mechanics." }
    ],
    codeExamples: [
      {
        title: 'JavaBean Standard',
        code: `import java.io.Serializable;

public class UserBean implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private String username;
    private int age;
    
    // Public zero-arg constructor
    public UserBean() {}
    
    // Getters & Setters
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public int getAge() {
        return age;
    }
    
    public void setAge(int age) {
        this.age = age;
    }
}`,
        explanation: 'Enforces encapsulation via private fields and public accessors, while Serializable enables saving states to files or databases.',
        output: '(no stdout output - defines a reusable class)'
      }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'Which is a strict requirement for a JavaBean?', options: ['Must inherit from JFrame', 'Must have a public zero-argument constructor', 'Must be declared final', 'Must not have helper methods'], correct: 'Must have a public zero-argument constructor', explanation: 'JavaBeans require a default zero-arg constructor so frameworks can instantiate them dynamically via reflection.' },
        { id: 'q2', question: 'Which interface allows beans to convert to byte streams?', options: ['Cloneable', 'Serializable', 'Comparable', 'Runnable'], correct: 'Serializable', explanation: 'java.io.Serializable marks bean classes as safe for network streaming and storage.' },
        { id: 'q3', question: 'How do you name a setter method for a property named "active"?', options: ['setActive(boolean active)', 'setactive(boolean active)', 'makeActive(boolean active)', 'writeActive(boolean active)'], correct: 'setActive(boolean active)', explanation: 'Setters append capitalized property names to the "set" prefix.' },
        { id: 'q4', question: 'How do you name a getter method for a boolean property named "valid"?', options: ['getValid()', 'isValid()', 'valid()', 'checkValid()'], correct: 'isValid()', explanation: 'Boolean getters use the "is" prefix instead of "get".' },
        { id: 'q5', question: 'What is serialVersionUID used for?', options: ['Store session identifiers', 'Verify sender and receiver JVM loaded identical classes for serialization compatibility', 'Count active bean instances', 'Speed up compiler compilation'], correct: 'Verify sender and receiver JVM loaded identical classes for serialization compatibility', explanation: 'serialVersionUID acts as a version control mechanism during deserialization checks.' },
        { id: 'q6', question: 'Which keyword prevents a specific field from being serialized?', options: ['volatile', 'transient', 'native', 'strictfp'], correct: 'transient', explanation: 'The transient keyword tells JVM not to write the marked field into byte streams.' },
        { id: 'q7', question: 'What role do JavaBeans play in MVC systems?', options: ['Controller mappings', 'Model representation for containing data', 'Routing logic components', 'Database query compilers'], correct: 'Model representation for containing data', explanation: 'JavaBeans represent Model objects, transferring state between Controllers and Views.' },
        { id: 'q8', question: 'Are JavaBeans thread-safe by design?', options: ['Yes, always', 'No, getters/setters contain no synchronizations by default', 'Depends on JVM version', 'Only if serialized'], correct: 'No, getters/setters contain no synchronizations by default', explanation: 'Beans are simple data containers and do not provide thread safety internally.' },
        { id: 'q9', question: 'What defines a write-only property in a JavaBean?', options: ['Declaring variables transient', 'Providing a setter method but no getter method', 'Adding final constraints', 'Declaring properties private only'], correct: 'Providing a setter method but no getter method', explanation: 'Omitting getter accessors makes properties write-only.' },
        { id: 'q10', question: 'Which API uses beans extensively to configure dynamic objects?', options: ['Java Reflection API', 'Direct Socket API', 'Compiler API', 'Thread API'], correct: 'Java Reflection API', explanation: 'Enterprise containers dynamically resolve and instantiate Beans using Java reflection.' }
      ],
      coding: [
        {
          id: 'c1',
          title: 'Default Constructor Builder',
          description: 'Define a public default constructor and field accessors for this Employee bean class.',
          starterCode: `import java.io.Serializable;

public class Employee implements Serializable {
    private String name;
    // TODO: Add default constructor, getter and setter
}`,
          solution: `import java.io.Serializable;

public class Employee implements Serializable {
    private String name;
    
    public Employee() {}
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
}`
        },
        {
          id: 'c2',
          title: 'Transient Attribute Guard',
          description: 'Declare a password property that must NOT be serialized when writing the bean to disk.',
          starterCode: `import java.io.Serializable;

public class Account implements Serializable {
    // TODO: Declare a transient String password field
}`,
          solution: `import java.io.Serializable;

public class Account implements Serializable {
    private transient String password;
    
    public Account() {}
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
}`
        },
        {
          id: 'c3',
          title: 'Boolean Getter implementation',
          description: 'Construct property declarations and accessors for a boolean property named "premiumStatus".',
          starterCode: `public class Member {
    private boolean premiumStatus;
    // TODO: Add public accessors matching conventions
}`,
          solution: `public class Member {
    private boolean premiumStatus;
    
    public Member() {}
    
    public boolean isPremiumStatus() {
        return premiumStatus;
    }
    
    public void setPremiumStatus(boolean premiumStatus) {
        this.premiumStatus = premiumStatus;
    }
}`
        }
      ],
      scenario: [
        {
          id: 's1',
          question: "An application throws InvalidClassException during deserialization of a JavaBean stored in cache after you updated one private helper method. What did you omit?",
          hint: "Think about class versioning and serialVersionUID.",
          explanation: "You did not declare a static final long serialVersionUID. If omitted, the compiler generates one automatically. Changing class details forces a new ID to be calculated, causing incompatibility with cached JVM bytes. Declare serialVersionUID explicitly."
        },
        {
          id: 's2',
          question: "Your enterprise service needs to parse hundreds of incoming JSON requests into JavaBeans. The parser throws instantiation errors for one specific bean. What is the root cause?",
          hint: "Do you have the correct constructor parameters?",
          explanation: "The JavaBean is missing a public zero-argument constructor. Serialization/Parsing frameworks instantiate beans dynamically via reflection and need a default constructor to construct the objects before populating fields."
        }
      ]
    },
    summary: "JavaBeans enforce encapsulation standards. Default constructors, serializers, and proper getter/setter conventions make JavaBeans easily readable by containers."
  },
  {
    id: 6,
    slug: 'hibernate',
    title: 'Hibernate',
    difficulty: 'Advanced',
    duration: '90 mins',
    xp: 400,
    accent: '#3B82F6',
    icon: '❄️',
    description: 'Learn Object-Relational Mapping (ORM), entity mapping config, HQL queries, relationships, and CRUD transactions.',
    topics: ['ORM', 'Entity Mapping', 'HQL', 'Relationships', 'CRUD'],
    architectExplain: {
      whyCompaniesUseIt: "Eliminates repetitive JDBC SQL boilerplates by mapping Java entity objects directly to relational database tables.",
      scalabilityImpact: "Lazy Loading prevents loading massive child hierarchies unless accessed. Session-level first level caches improve read speeds.",
      performanceImpact: "N+1 query problem can cause latency spikes. Eager fetching or JOIN fetch queries must be configured to fetch relationships in one step.",
      realWorldExamples: "Enterprise financial applications map Account, Transaction, and User entity models using JPA annotations and query databases via Spring Data JPA.",
      decisions: "Always configure lazy loading by default. Avoid EAGER fetch types unless specifically required, to keep database loads minimal."
    },
    script: [
      { type: 'intro', text: "Welcome to Hibernate ORM. Hibernate is an Object-Relational Mapping framework that translates Java classes to SQL database structures." },
      { type: 'concept', text: "The core annotations are: @Entity declares a table class, @Table specifies the name, @Id configures key columns, and @Column names standard columns." },
      { type: 'code', text: "Here is a Hibernate transaction in action. We open a Session from SessionFactory, begin a transaction, persist an entity, and commit." },
      { type: 'warn', text: "Watch out for the N+1 select problem! If you loop through parent entities and touch their lazy-loaded children, Hibernate executes separate queries for every child, creating severe bottlenecks." },
      { type: 'concept', text: "Hibernate Query Language (HQL) operates on Java objects instead of raw SQL table strings. This maintains compiler safety and database portability." },
      { type: 'quiz', text: "Which JPA annotation is used to mark a field as the primary key of an entity?" },
      { type: 'summary', text: "Excellent! You understand ORM principles, mapping relationships, lazy loading, and transactional management in Hibernate." }
    ],
    codeExamples: [
      {
        title: 'Hibernate CRUD Entity',
        code: `import javax.persistence.*;

@Entity
@Table(name = "employees")
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "first_name", nullable = false)
    private String firstName;
    
    // Constructors, Getters & Setters
    public Employee() {}
    
    public Long getId() { return id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String fn) { this.firstName = fn; }
}`,
        explanation: 'JPA annotations map Java fields to database tables. GenerationType.IDENTITY configures auto-incrementing primary keys.',
        output: '(defines a persistent entity mapped to employees table)'
      }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'What does ORM stand for?', options: ['Object-Relational Mapping', 'Open Resource Management', 'Ordered Query Matrix', 'Object Registry Model'], correct: 'Object-Relational Mapping', explanation: 'ORM maps object-oriented classes to relational database tables.' },
        { id: 'q2', question: 'Which object creates Session objects in Hibernate?', options: ['SessionCreator', 'SessionFactory', 'SessionManager', 'ConnectionPool'], correct: 'SessionFactory', explanation: 'SessionFactory is a heavy thread-safe object instantiated once to compile meta-data and spawn Session connections.' },
        { id: 'q3', question: 'What state represents an entity instance newly created with "new" but not yet saved?', options: ['Persistent', 'Detached', 'Transient', 'Removed'], correct: 'Transient', explanation: 'Transient objects have no database row associated and are not tracked by active Session managers.' },
        { id: 'q4', question: 'Which query language does Hibernate use?', options: ['SQL', 'JPQL/HQL', 'GraphQL', 'MongoQuery'], correct: 'JPQL/HQL', explanation: 'HQL queries target persistent Java entity names and properties, not raw database table rows.' },
        { id: 'q5', question: 'What does the N+1 problem describe?', options: ['Creating too many columns', 'Executing N extra child SQL queries when loading a list of parent records', 'Transaction deadlock', 'Exhausting database threads'], correct: 'Executing N extra child SQL queries when loading a list of parent records', explanation: 'When loading N parents with lazy-loaded children, touching each child executes N separate queries, plus 1 to fetch parents.' },
        { id: 'q6', question: 'What is the default fetch type for a @OneToMany relationship?', options: ['EAGER', 'LAZY', 'DYNAMIC', 'STICKY'], correct: 'LAZY', explanation: 'To prevent performance issues, @OneToMany collections defaults to LAZY loading.' },
        { id: 'q7', question: 'Which class manages the Persistence Context in JPA?', options: ['SessionFactory', 'EntityManager', 'Query', 'CriteriaBuilder'], correct: 'EntityManager', explanation: 'EntityManager manages persistence life cycles in standard JPA systems.' },
        { id: 'q8', question: 'What is first-level cache in Hibernate?', options: ['A shared Ehcache instance', 'Session-level transaction cache', 'Database buffer pool', 'Browser storage'], correct: 'Session-level transaction cache', explanation: 'First-level cache is active for the current Session object and caches objects retrieved by ID.' },
        { id: 'q9', question: 'How is Second-Level cache scope defined?', options: ['Session scope', 'SessionFactory/Application scope', 'Transaction scope', 'JVM garbage collection scope'], correct: 'SessionFactory/Application scope', explanation: 'Second-level caching is shared across sessions to avoid repeating identical queries.' },
        { id: 'q10', question: 'Which cascading strategy deletes children when a parent is deleted?', options: ['CascadeType.PERSIST', 'CascadeType.REMOVE', 'CascadeType.DETACH', 'CascadeType.REFRESH'], correct: 'CascadeType.REMOVE', explanation: 'CascadeType.REMOVE propagates delete operations down to all child records automatically.' }
      ],
      coding: [
        {
          id: 'c1',
          title: 'Entity Mapping annotator',
          description: 'Add JPA annotations to map this User class to table "users" with primary key "id" auto-incremented.',
          starterCode: `public class User {
    private Long id;
    private String email;
}`,
          solution: `import javax.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String email;
    
    public User() {}
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}`
        },
        {
          id: 'c2',
          title: 'HQL Fetch Query',
          description: 'Construct an HQL query that retrieves all Employee objects where salary is greater than a parameter.',
          starterCode: `import org.hibernate.Session;
import org.hibernate.query.Query;
import java.util.List;

public class QueryBuilder {
    public List<Employee> getHighEarners(Session session, double salary) {
        String hql = "FROM Employee e WHERE e.salary > :sal";
        // TODO: Create query, set parameter sal, return list
        return null;
    }
}`,
          solution: `import org.hibernate.Session;
import org.hibernate.query.Query;
import java.util.List;

public class QueryBuilder {
    public List<Employee> getHighEarners(Session session, double salary) {
        String hql = "FROM Employee e WHERE e.salary > :sal";
        Query<Employee> query = session.createQuery(hql, Employee.class);
        query.setParameter("sal", salary);
        return query.getResultList();
    }
}`
        },
        {
          id: 'c3',
          title: 'Save Operation Controller',
          description: 'Save a transient Employee entity instance using Session transaction controls.',
          starterCode: `import org.hibernate.Session;

public class PersistenceUnit {
    public void persistEmployee(Session session, Employee emp) {
        // TODO: Start transaction, persist employee, commit
    }
}`,
          solution: `import org.hibernate.Session;

public class PersistenceUnit {
    public void persistEmployee(Session session, Employee emp) {
        try {
            session.beginTransaction();
            session.save(emp);
            session.getTransaction().commit();
        } catch (Exception e) {
            session.getTransaction().rollback();
            throw e;
        }
    }
}`
        }
      ],
      scenario: [
        {
          id: 's1',
          question: "An application dashboard queries 100 User entities. The Hibernate logs reveal 101 SQL queries executed to print their addresses. How do you optimize this?",
          hint: "The addresses are mapped as Lazy. Use a fetch join.",
          explanation: "This is the N+1 query problem. Modify the HQL query to use join fetching: `FROM User u JOIN FETCH u.addresses`. This retrieves users and their addresses in a single SQL JOIN query, reducing database roundtrips."
        },
        {
          id: 's2',
          question: "You try to access a lazy relationship collection after calling `session.close()`. The application throws `LazyInitializationException`. Explain how you fix it.",
          hint: "Why did the proxy fail to initialize, and how do you resolve it?",
          explanation: "Hibernate cannot query the database for lazy collections after the Session closes. Initialize the collection before closing using Hibernate.initialize(user.getAddresses()), or use JOIN FETCH, or keep the Session active."
        }
      ]
    },
    summary: "Hibernate abstracts SQL mapping details. Configuring lazy load structures, tuning transaction boundaries, and resolving query performance bottlenecks prevents latency spikes."
  },
  {
    id: 7,
    slug: 'spring-core',
    title: 'Spring Core',
    difficulty: 'Advanced',
    duration: '90 mins',
    xp: 400,
    accent: '#10B981',
    icon: '🌱',
    description: 'Learn Dependency Injection (DI), Inversion of Control (IoC), Spring container bean lifecycle, and autowiring configurations.',
    topics: ['IoC', 'Dependency Injection', 'Bean Lifecycle', 'Annotations'],
    architectExplain: {
      whyCompaniesUseIt: "Promotes loose coupling between services. Spring manages object lifetimes, instantiations, and linking parameters dynamically.",
      scalabilityImpact: "Singletons are stateless. Spring maintains stateless bean instances to allow scaling horizontally across multi-node servers.",
      performanceImpact: "Spring container startup can take longer due to scanning files. Once initialized, bean access is very fast with no overhead.",
      realWorldExamples: "Almost all enterprise Java application backends use Spring Core to wire controller, service, and database repository classes.",
      decisions: "Prefer constructor injection over field injection (@Autowired) to make unit testing easier and allow final dependencies."
    },
    script: [
      { type: 'intro', text: "Welcome to Spring Core. Inversion of Control (IoC) means delegation of object instantiation controls from your application classes to the framework container." },
      { type: 'concept', text: "Dependency Injection (DI) is the pattern where Spring provides the required dependencies to a class at runtime." },
      { type: 'code', text: "Look at this Service class. We declare dependencies as final and use constructor injection. This is clean and allows mock test injections easily." },
      { type: 'warn', text: "Warning: Avoid using field injection with @Autowired on private variables. It makes unit testing harder because you cannot mock dependencies without reflection utilities." },
      { type: 'quiz', text: "Which annotation registers a Java class as a Spring Bean component in the ApplicationContext?" },
      { type: 'summary', text: "Excellent! You understand Spring's IoC container, bean lifecycle events, scopes, and dependency wiring techniques." }
    ],
    codeExamples: [
      {
        title: 'Constructor Injection',
        code: `import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class UserService {
    private final UserRepository userRepo;
    
    // Constructor injection (Preferred)
    public UserService(UserRepository userRepo) {
        this.userRepo = userRepo;
    }
    
    public void printUsers() {
        userRepo.findAll().forEach(System.out::println);
    }
}`,
        explanation: 'Declaring dependencies final ensures they are initialized at instantiation, making the class thread-safe and easy to unit test.',
        output: '(defines a bean managed by Spring IoC container)'
      }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'What is Inversion of Control (IoC)?', options: ['Inverting array items', 'Delegating object creation and lifecycle management to the container', 'Restructuring loops', 'Running Java inside browser containers'], correct: 'Delegating object creation and lifecycle management to the container', explanation: 'IoC shifts control of instantiating and wiring classes from developers to the Spring framework.' },
        { id: 'q2', question: 'Which interface represents the Spring IoC container?', options: ['BeanFactory', 'ApplicationContext', 'BeanContainer', 'SpringRegistry'], correct: 'ApplicationContext', explanation: 'ApplicationContext inherits from BeanFactory and provides advanced services like AOP integration, events, and i18n.' },
        { id: 'q3', question: 'What is the default scope of a Spring Bean?', options: ['prototype', 'singleton', 'request', 'session'], correct: 'singleton', explanation: 'Spring instantiates only a single instance of a bean per ApplicationContext container by default.' },
        { id: 'q4', question: 'Which bean scope instantiates a new object every time it is requested?', options: ['singleton', 'prototype', 'session', 'global'], correct: 'prototype', explanation: 'Prototype scope tells Spring to return a fresh bean object instance for every injection request.' },
        { id: 'q5', question: 'Which annotation registers configuration classes containing bean definitions?', options: ['@Service', '@Repository', '@Configuration', '@Controller'], correct: '@Configuration', explanation: '@Configuration tells Spring the class defines bean factory declarations via @Bean annotations.' },
        { id: 'q6', question: 'Which annotation triggers custom bean initialization code after instantiation?', options: ['@PostConstruct', '@PreDestroy', '@BeanInit', '@Setup'], correct: '@PostConstruct', explanation: '@PostConstruct marks methods to run after Spring completes dependency injections.' },
        { id: 'q7', question: 'How can you resolve ambiguity when multiple beans of the same type exist?', options: ['@Autowired', '@Qualifier', '@Primary', 'Both @Qualifier and @Primary'], correct: 'Both @Qualifier and @Primary', explanation: 'Use @Qualifier to name a specific bean, or @Primary to set a default fallback bean.' },
        { id: 'q8', question: 'Which annotation enables Spring to scan for components in specified packages?', options: ['@ComponentScan', '@EnableAutoConfiguration', '@WebMvcTest', '@Import'], correct: '@ComponentScan', explanation: '@ComponentScan scans directories for classes marked with component annotations.' },
        { id: 'q9', question: 'What is the main benefit of constructor injection over field injection?', options: ['Faster execution speed', 'Compiles faster', 'Allows immutable dependencies and easier unit testing without reflection', 'Reduces class sizes'], correct: 'Allows immutable dependencies and easier unit testing without reflection', explanation: 'Constructor injection allows using final fields and lets you easily pass mock dependency objects in tests.' },
        { id: 'q10', question: 'Which lifecycle event runs before a singleton bean is destroyed?', options: ['@PreDestroy', 'finalize()', 'onDestroy()', 'bean.close()'], correct: '@PreDestroy', explanation: '@PreDestroy marks methods to release resources or close database connections before the container closes.' }
      ],
      coding: [
        {
          id: 'c1',
          title: 'Configuration Bean Builder',
          description: 'Create a Spring configuration class that declares a bean of type java.util.ArrayList named "dataList".',
          starterCode: `import org.springframework.context.annotation.*;
import java.util.List;
import java.util.ArrayList;

// TODO: Annotate class and define bean method
public class AppConfig {
}`,
          solution: `import org.springframework.context.annotation.*;
import java.util.List;
import java.util.ArrayList;

@Configuration
public class AppConfig {
    @Bean
    public List<String> dataList() {
        return new ArrayList<>();
    }
}`
        },
        {
          id: 'c2',
          title: 'Service Constructor Injector',
          description: 'Refactor this controller class to inject the dependency using constructor injection.',
          starterCode: `import org.springframework.stereotype.Controller;

@Controller
public class ProductController {
    private ProductService service;
    
    // TODO: Add constructor injection
}`,
          solution: `import org.springframework.stereotype.Controller;

@Controller
public class ProductController {
    private final ProductService service;
    
    public ProductController(ProductService service) {
        this.service = service;
    }
}`
        },
        {
          id: 'c3',
          title: 'Qualifier Ambiguity Resolver',
          description: 'Inject a ProductService instance named "standardService" using Qualifier attributes.',
          starterCode: `import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
public class StoreManager {
    private ProductService service;
    
    // TODO: Add constructor with Qualifier annotation
}`,
          solution: `import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
public class StoreManager {
    private final ProductService service;
    
    public StoreManager(@Qualifier("standardService") ProductService service) {
        this.service = service;
    }
}`
        }
      ],
      scenario: [
        {
          id: 's1',
          question: "You deploy a Spring application and get a `BeanCurrentlyInCreationException` highlighting a cyclic dependency between ServiceA and ServiceB. How do you resolve this?",
          hint: "The services inject each other in their constructors. How do you break this loop?",
          explanation: "Redesign the classes to remove the cyclic dependency. Refactor the shared logic into a ServiceC, or use Setter/Field injection instead of constructor injection, or use the `@Lazy` annotation on one of the dependency injection parameters."
        },
        {
          id: 's2',
          question: "An application has a prototype-scoped bean injected into a singleton-scoped bean. Developers notice that the prototype bean behaves like a singleton, never recreating. Why?",
          hint: "How often is the singleton bean instantiated and injected?",
          explanation: "Since the singleton is only instantiated once, its dependencies are also injected only once. Use lookup method injection, or implement ApplicationContextAware to fetch a fresh instance, or inject a Provider/ObjectProvider instead."
        }
      ]
    },
    summary: "Spring Core coordinates dependency wiring. Preferring constructor injection, using Qualifier naming rules, and understanding scopes avoids circular dependencies."
  },
  {
    id: 8,
    slug: 'spring-boot',
    title: 'Spring Boot',
    difficulty: 'Advanced',
    duration: '120 mins',
    xp: 500,
    accent: '#8B5CF6',
    icon: '⚡',
    description: 'Learn Spring Boot auto-configuration, REST controllers, services, repositories, and application properties.',
    topics: ['Auto Configuration', 'REST APIs', 'Controllers', 'Services', 'Repositories'],
    architectExplain: {
      whyCompaniesUseIt: "Drastically reduces development setup times using starter dependencies and opinionated auto-configurations.",
      scalabilityImpact: "Spring Boot produces fat JARs with embedded servlet containers (Tomcat/Undertow), allowing easy containerization in Docker/Kubernetes.",
      performanceImpact: "Spring Boot auto-configuration can load unnecessary beans. Use @SpringBootApplication exclusions to tune loading times.",
      realWorldExamples: "E-commerce backends use Spring Boot to build microservices that run in independent containers, communicating over JSON.",
      decisions: "Externalize properties in application.properties or application.yml using environment variables to keep build artifacts portable."
    },
    script: [
      { type: 'intro', text: "Welcome to Spring Boot. Spring Boot is an opinionated framework built on top of Spring that simplifies bootstrapping and deploying web applications." },
      { type: 'concept', text: "Auto-configuration is a key feature. Spring Boot automatically configures beans based on the libraries (starter JARs) found on your classpath." },
      { type: 'code', text: "Here is a standard REST controller. We use @RestController, map request endpoints via @GetMapping, and return Java objects which automatically serialize to JSON." },
      { type: 'warn', text: "Important: Never hardcode database connection details, passwords, or endpoints. Use properties file placeholders and inject them using the @Value annotation." },
      { type: 'quiz', text: "Which annotation combines @Configuration, @EnableAutoConfiguration, and @ComponentScan into a single trigger?" },
      { type: 'summary', text: "Excellent! You understand Spring Boot startup flows, starter dependencies, REST controllers, and application configuration." }
    ],
    codeExamples: [
      {
        title: 'REST API Controller',
        code: `import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService service;
    
    public ProductController(ProductService service) {
        this.service = service;
    }
    
    @GetMapping
    public List<Product> getAll() {
        return service.getAllProducts();
    }
    
    @PostMapping
    public Product create(@RequestBody Product p) {
        return service.saveProduct(p);
    }
}`,
        explanation: '@RestController returns JSON responses directly. @RequestBody tells Spring to parse incoming JSON payloads into Java objects.',
        output: '(HTTP GET /api/products returns JSON arrays)'
      }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'What is the primary goal of Spring Boot?', options: ['Provide compiler optimizations', 'Simplify bootstrapping and application deployment', 'Replace the Java Virtual Machine', 'Manage database replication'], correct: 'Simplify bootstrapping and application deployment', explanation: 'Spring Boot simplifies setup by offering opinionated starter packages and auto-configuration.' },
        { id: 'q2', question: 'Which file is commonly used for configurations in Spring Boot?', options: ['config.xml', 'application.properties or application.yml', 'web.xml', 'settings.gradle'], correct: 'application.properties or application.yml', explanation: 'Spring Boot loads application properties or YAML files to configure options like port, database URL, etc.' },
        { id: 'q3', question: 'Which annotation marks a class as a REST controller?', options: ['@Controller', '@RestController', '@ResponseBody', '@Endpoint'], correct: '@RestController', explanation: '@RestController combines @Controller and @ResponseBody, serializing return values directly to HTTP response bodies.' },
        { id: 'q4', question: 'How does Spring Boot package web applications by default?', options: ['As a WAR file', 'As an executable JAR file with embedded Tomcat', 'As a static HTML folder', 'As a SQL schema script'], correct: 'As an executable JAR file with embedded Tomcat', explanation: 'Spring Boot packages applications into fat JARs containing embedded servers, run directly via: java -jar app.jar.' },
        { id: 'q5', question: 'Which starter dependency is required to build web applications?', options: ['spring-boot-starter-jdbc', 'spring-boot-starter-web', 'spring-boot-starter-test', 'spring-boot-starter-aop'], correct: 'spring-boot-starter-web', explanation: 'spring-boot-starter-web pulls in dependencies for REST controllers, Tomcat, validation, and JSON serializers.' },
        { id: 'q6', question: 'Which annotation enables Spring Boot to auto-configure beans?', options: ['@EnableAutoConfiguration', '@SpringBootApplication', '@EnableConfigurationProperties', 'Both @EnableAutoConfiguration and @SpringBootApplication'], correct: 'Both @EnableAutoConfiguration and @SpringBootApplication', explanation: '@SpringBootApplication includes @EnableAutoConfiguration, which automatically configures components based on classpath JARs.' },
        { id: 'q7', question: 'What does Spring Boot DevTools provide?', options: ['Production database migration tools', 'Automatic application restart and browser live-reload during development', 'Enhanced security scanning', 'Memory profiling metrics'], correct: 'Automatic application restart and browser live-reload during development', explanation: 'DevTools detects code changes and restarts the application context automatically, speeding up development.' },
        { id: 'q8', question: 'Which interface allows running custom logic immediately after Spring Boot startup?', options: ['CommandLineRunner', 'ServletContextListener', 'ApplicationRunner', 'Both CommandLineRunner and ApplicationRunner'], correct: 'Both CommandLineRunner and ApplicationRunner', explanation: 'CommandLineRunner and ApplicationRunner execute logic immediately after container initialization completes.' },
        { id: 'q9', question: 'How can you specify a custom server port in Spring Boot?', options: ['server.port=8081 inside application.properties', 'Modify Tomcat configs manually', 'Declare PortBean', 'Use JVM -Dport=8081'], correct: 'server.port=8081 inside application.properties', explanation: 'Setting server.port in application.properties changes the default HTTP port (8080) of the embedded server.' },
        { id: 'q10', question: 'Which Spring Boot component exposes application health metrics?', options: ['Spring Boot DevTools', 'Spring Boot Actuator', 'Spring Initializr', 'Spring Security'], correct: 'Spring Boot Actuator', explanation: 'Spring Boot Actuator provides built-in endpoints (like /actuator/health) to monitor app health, metrics, and configurations.' }
      ],
      coding: [
        {
          id: 'c1',
          title: 'REST Endpoint Constructor',
          description: 'Construct a GET endpoint at "/api/status" that returns the string "RUNNING".',
          starterCode: `import org.springframework.web.bind.annotation.*;

@RestController
public class StatusController {
    // TODO: Map GET endpoint at /api/status
}`,
          solution: `import org.springframework.web.bind.annotation.*;

@RestController
public class StatusController {
    @GetMapping("/api/status")
    public String getStatus() {
        return "RUNNING";
    }
}`
        },
        {
          id: 'c2',
          title: 'Config Value Injector',
          description: 'Inject the configuration property "app.version" into a private String field using @Value.',
          starterCode: `import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class VersionController {
    // TODO: Inject app.version property
    private String version;
}`,
          solution: `import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class VersionController {
    @Value("\${app.version}")
    private String version;
    
    public String getVersion() {
        return version;
    }
}`
        },
        {
          id: 'c3',
          title: 'Resource Post API',
          description: 'Write a POST endpoint at "/api/users" that receives a User payload and returns it.',
          starterCode: `import org.springframework.web.bind.annotation.*;

@RestController
public class UserController {
    // TODO: Map POST endpoint receiving and returning User body
}`,
          solution: `import org.springframework.web.bind.annotation.*;

@RestController
public class UserController {
    @PostMapping("/api/users")
    public User createUser(@RequestBody User user) {
        // Business logic would save user here
        return user;
    }
}`
        }
      ],
      scenario: [
        {
          id: 's1',
          question: "Your Spring Boot application takes 40 seconds to start. You find that it scans massive third-party packages. How do you limit Component Scanning?",
          hint: "What parameters does @SpringBootApplication support?",
          explanation: "Specify base packages explicitly: `@SpringBootApplication(scanBasePackages = 'com.myproject.app')`. This instructs Spring to scan only specified directories, avoiding scanning third-party libraries."
        },
        {
          id: 's2',
          question: "You want to dynamically switch between PostgreSQL in production and H2 in-memory databases in test environments. How do you configure this in Spring Boot?",
          hint: "Think about Spring Profiles.",
          explanation: "Create profile-specific configuration files: `application-prod.yml` and `application-test.yml`. Activate profiles at startup using the JVM argument `-Dspring.profiles.active=prod` or `-Dspring.profiles.active=test`."
        }
      ]
    },
    summary: "Spring Boot simplifies Java web development. Starter templates, auto-configurations, profiles, and embedded servlet containers make deployment straightforward."
  },
  {
    id: 9,
    slug: 'spring-security',
    title: 'Spring Security',
    difficulty: 'Advanced',
    duration: '90 mins',
    xp: 450,
    accent: '#EC4899',
    icon: '🛡️',
    description: 'Learn enterprise security patterns including authentication pipelines, authorizations, JWT tokens, and method protection.',
    topics: ['Authentication', 'Authorization', 'JWT', 'Role Based Access'],
    architectExplain: {
      whyCompaniesUseIt: "Standardizes access control. Protects web endpoints against unauthorized access, XSS, CSRF, and SQL injections.",
      scalabilityImpact: "Standard session-based authentication requires session replication. Stateless JWT security allows high horizontal scalability.",
      performanceImpact: "Hashing algorithms (like BCrypt) consume CPU to resist brute-force attacks. Tune hashing rounds to balance security and speed.",
      realWorldExamples: "Bank portals or mobile application gateways authenticate incoming APIs using JWT tokens and role-based permissions.",
      decisions: "Use BCrypt for password hashing. Disable CSRF protection on stateless REST APIs, but always keep it enabled for browser MVC portals."
    },
    script: [
      { type: 'intro', text: "Welcome to Spring Security. Security is a primary concern in enterprise systems. Spring Security acts as a filter chain that intercepts HTTP requests." },
      { type: 'concept', text: "Authentication verifies WHO you are (credentials), while Authorization verifies WHAT you are allowed to access (roles and permissions)." },
      { type: 'code', text: "Look at this WebSecurityConfigurerAdapter configuration class. We declare API endpoints public, protect administrative actions, and enforce stateless JWT sessions." },
      { type: 'warn', text: "Warning: Never store user passwords in plain text! Always hash them using robust algorithms like BCryptPasswordEncoder." },
      { type: 'quiz', text: "Which Spring Security filter is responsible for intercepting usernames and passwords during login?" },
      { type: 'summary', text: "Excellent! You understand Spring Security filter chains, password hashing, role permissions, and stateless JWT setups." }
    ],
    codeExamples: [
      {
        title: 'Stateless Security Config',
        code: `import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;

@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .csrf().disable() // Disable CSRF for stateless APIs
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeRequests()
            .antMatchers("/api/public/**").permitAll()
            .antMatchers("/api/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated();
    }
}`,
        explanation: 'Configures stateless security by disabling sessions and protecting routes using URL matches and roles.',
        output: '(registers a security filter chain in Spring Context)'
      }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'What is the role of authentication?', options: ['Validate user access permissions', 'Validate user identity/credentials', 'Encrypt database connection strings', 'Audit query executions'], correct: 'Validate user identity/credentials', explanation: 'Authentication validates credentials (like passwords) to verify the user\'s identity.' },
        { id: 'q2', question: 'What is the role of authorization?', options: ['Validate credentials', 'Determine if an authenticated user has permissions to access a resource', 'Create session IDs', 'Decrypt network packets'], correct: 'Determine if an authenticated user has permissions to access a resource', explanation: 'Authorization checks user roles and privileges to grant or deny access to resources.' },
        { id: 'q3', question: 'Which algorithm is recommended for password hashing?', options: ['MD5', 'SHA-1', 'BCrypt', 'Base64'], correct: 'BCrypt', explanation: 'BCrypt includes salt values and configurable work factors to secure against brute-force attacks.' },
        { id: 'q4', question: 'What does JWT stand for?', options: ['Java Web Token', 'JSON Web Token', 'Joint Web Transaction', 'JavaScript Web Tracker'], correct: 'JSON Web Token', explanation: 'JWT stands for JSON Web Token, used for stateless authentication.' },
        { id: 'q5', question: 'Which section of a JWT contains the user claims?', options: ['Header', 'Payload', 'Signature', 'Salt'], correct: 'Payload', explanation: 'The Payload contains user claims (like user ID, roles, and token expiration).' },
        { id: 'q6', question: 'How is a JWT signed?', options: ['Hashing algorithms encrypt the entire database', 'Signature is created by signing the base64-encoded Header and Payload with a secret key', 'Saved in a browser cookie', 'Encrypted by JVM bytecode'], correct: 'Signature is created by signing the base64-encoded Header and Payload with a secret key', explanation: 'The Signature is created by signing the Header and Payload using a secret key to prevent modification.' },
        { id: 'q7', question: 'Which Spring Security annotation secures controller methods?', options: ['@Secured', '@PreAuthorize', '@RolesAllowed', 'All of the above'], correct: 'All of the above', explanation: '@Secured, @PreAuthorize, and @RolesAllowed can all be used to secure methods based on roles.' },
        { id: 'q8', question: 'What is the main purpose of Cross-Site Request Forgery (CSRF) tokens?', options: ['Encrypt passwords', 'Prevent attackers from forcing users to submit unauthorized actions in their session context', 'Cache user profiles', 'Compress network payloads'], correct: 'Prevent attackers from forcing users to submit unauthorized actions in their session context', explanation: 'CSRF tokens ensure that state-changing requests originate from the authenticated application, not malicious sites.' },
        { id: 'q9', question: 'What mechanism extracts security details from threads in Spring Security?', options: ['ThreadLocal Context (SecurityContextHolder)', 'HttpSession Context', 'Database rows', 'Global Application Context'], correct: 'ThreadLocal Context (SecurityContextHolder)', explanation: 'SecurityContextHolder uses ThreadLocal to store security details, making them accessible throughout the execution thread.' },
        { id: 'q10', question: 'How can you disable CSRF protection in Spring Security configurations?', options: ['http.csrf().disable()', 'http.csrf().active(false)', 'security.csrf(false)', 'web.csrf().remove()'], correct: 'http.csrf().disable()', explanation: 'Call http.csrf().disable() in the Security Filter Chain configuration class.' }
      ],
      coding: [
        {
          id: 'c1',
          title: 'BCrypt Bean Builder',
          description: 'Declare a BCryptPasswordEncoder bean in a security configuration class.',
          starterCode: `import org.springframework.context.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

// TODO: Add bean configuration
public class AppSecurity {
}`,
          solution: `import org.springframework.context.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class AppSecurity {
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}`
        },
        {
          id: 'c2',
          title: 'Method Security Enabler',
          description: 'Add global method security annotations to a configuration class to enable @PreAuthorize.',
          starterCode: `import org.springframework.context.annotation.Configuration;

// TODO: Enable method security
@Configuration
public class MethodConfig {
}`,
          solution: `import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;

@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class MethodConfig {
}`
        },
        {
          id: 'c3',
          title: 'Role Authorization Checker',
          description: 'Use @PreAuthorize to restrict a controller method so only users with the role "ADMIN" can run it.',
          starterCode: `import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;

public class AdminController {
    // TODO: Restrict access to ADMIN role only
    @DeleteMapping("/api/admin/clean")
    public void deleteEverything() {}
}`,
          solution: `import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;

public class AdminController {
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/api/admin/clean")
    public void deleteEverything() {}
}`
        }
      ],
      scenario: [
        {
          id: 's1',
          question: "An application log shows CORS errors when a frontend client at http://localhost:5173 calls a Spring Boot backend at http://localhost:8080. How do you resolve this?",
          hint: "What mechanism handles cross-origin requests?",
          explanation: "Cross-Origin Resource Sharing (CORS) is blocked by browsers by default. Resolve this by adding `@CrossOrigin(origins = 'http://localhost:5173')` to controllers, or configure CORS globally in your WebMvcConfigurer."
        },
        {
          id: 's2',
          question: "You want to authenticate users using JWTs sent in the Authorization header. Where do you intercept this token to populate the SecurityContext?",
          hint: "Think about custom security filters.",
          explanation: "Create a custom filter extending `OncePerRequestFilter`. Extract the token from the request header, validate it, load the user details, and set the authentication details in the `SecurityContextHolder` before calling `filterChain.doFilter()`."
        }
      ]
    },
    summary: "Spring Security secures web endpoints. Hashing passwords, configuring stateless JWT access, and securing methods restricts unauthorized operations."
  },
  {
    id: 10,
    slug: 'microservices',
    title: 'Microservices',
    difficulty: 'Advanced',
    duration: '120 mins',
    xp: 600,
    accent: '#3B82F6',
    icon: '🌐',
    description: 'Learn microservices architectures: service discovery, API gateway routing, centralized configuration, and load balancing.',
    topics: ['Service Discovery', 'API Gateway', 'Config Server', 'Communication', 'Deployment'],
    architectExplain: {
      whyCompaniesUseIt: "Decouples large applications into smaller services, allowing teams to build, deploy, and scale services independently.",
      scalabilityImpact: "Allows autoscaling specific bottlenecks (like payment services) without scaling the entire application structure.",
      performanceImpact: "Network hops between services introduce latency. Use asynchronous communication (like RabbitMQ/Kafka) to keep services decoupled.",
      realWorldExamples: "Streaming platforms (like Netflix) use thousands of microservices coordinating behind API Gateways.",
      decisions: "Implement circuit breakers (like Resilience4j) to prevent cascading failures when downstream services time out."
    },
    script: [
      { type: 'intro', text: "Welcome to Microservices. A microservices architecture splits large monolithic systems into independent, self-contained services." },
      { type: 'concept', text: "Key patterns: Service Discovery (Eureka) tracks service locations, API Gateway routes client traffic, and Config Servers centralize settings." },
      { type: 'code', text: "Take a look at this API Gateway configuration. It routes incoming client requests to their destination services using Eureka naming rules." },
      { type: 'warn', text: "Warning: Cascading failures are dangerous! If a downstream service fails, it can block threads upstream, bringing down the entire system. Always implement circuit breakers." },
      { type: 'quiz', text: "Which Spring Cloud component acts as the Service Registry where services register their locations?" },
      { type: 'summary', text: "Excellent! You understand Service Discovery, API Gateway routing, load balancing, and resilient microservices design." }
    ],
    codeExamples: [
      {
        title: 'API Gateway Routing',
        code: `import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("user-service-route", r -> r.path("/users/**")
                .uri("lb://USER-SERVICE")) // load-balanced destination
            .route("order-service-route", r -> r.path("/orders/**")
                .uri("lb://ORDER-SERVICE"))
            .build();
    }
}`,
        explanation: 'Routes paths to Eureka services. lb:// prefix uses Eureka to resolve service locations and balance traffic.',
        output: '(registers gateway routing rules in Spring Cloud)'
      }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'What is Microservices architecture?', options: ['Putting classes in subpackages', 'Splitting applications into small, independently deployable services', 'Sharing database tables', 'Inverting thread executors'], correct: 'Splitting applications into small, independently deployable services', explanation: 'Microservices separate applications into small, focused, and independently deployable services.' },
        { id: 'q2', question: 'What is the role of Service Discovery (like Netflix Eureka)?', options: ['Query databases', 'Track network locations of active service instances dynamically', 'Enforce user authentication', 'Compress responses'], correct: 'Track network locations of active service instances dynamically', explanation: 'Service Discovery registers and tracks IP locations of active service instances dynamically.' },
        { id: 'q3', question: 'What is the role of an API Gateway (like Spring Cloud Gateway)?', options: ['Route client calls, handle auth, and perform load balancing', 'Manage database replication', 'Run unit tests', 'Compile Java bytecode'], correct: 'Route client calls, handle auth, and perform load balancing', explanation: 'API Gateways route client requests to backend services, handling authentication and rate-limiting.' },
        { id: 'q4', question: 'Which library is commonly used for implementing Circuit Breakers in Spring Boot?', options: ['Eureka', 'Resilience4j', 'Spring Security', 'Zuul'], correct: 'Resilience4j', explanation: 'Resilience4j provides circuit breakers, rate limiters, and retry mechanics to build fault-tolerant apps.' },
        { id: 'q5', question: 'What is a Config Server used for?', options: ['Run unit tests', 'Centralize application properties across environments for all microservices', 'Register service locations', 'Manage user logins'], correct: 'Centralize application properties across environments for all microservices', explanation: 'Config Servers centralize properties for all microservices in one place, like a Git repository.' },
        { id: 'q6', question: 'What is the purpose of a Circuit Breaker?', options: ['Accelerate compilation', 'Stop network connections', 'Prevent cascading failures by failing fast when downstream services time out', 'Encrypt payloads'], correct: 'Prevent cascading failures by failing fast when downstream services time out', explanation: 'Circuit breakers intercept downstream timeouts and fail fast, preventing thread exhaustion.' },
        { id: 'q7', question: 'What is the main benefit of asynchronous communication (like RabbitMQ) over REST?', options: ['Easier debugging', 'Decouples service runtimes, preventing blocking operations', 'Faster compilation', 'Better transaction safety'], correct: 'Decouples service runtimes, preventing blocking operations', explanation: 'Asynchronous event queues decouple runtimes, allowing services to process messages at their own pace.' },
        { id: 'q8', question: 'What does the lb:// prefix mean in Spring Cloud Gateway?', options: ['Localhost binding', 'Load Balanced destination resolved via service registry', 'Logger bypass', 'Latency buffer'], correct: 'Load Balanced destination resolved via service registry', explanation: 'lb:// tells the gateway to query Eureka for service locations and load-balance requests.' },
        { id: 'q9', question: 'How can you scale a microservice?', options: ['Recompile classes', 'Spin up additional service instances behind a load balancer', 'Add more columns to tables', 'Write bigger functions'], correct: 'Spin up additional service instances behind a load balancer', explanation: 'Autoscaling groups launch new service instances, which register with Eureka to balance traffic.' },
        { id: 'q10', question: 'What pattern coordinates database transactions across multiple microservices?', options: ['Saga Pattern', 'Two-Phase Commit', 'Command Query Responsibility Segregation (CQRS)', 'Both Saga and Two-Phase Commit'], correct: 'Both Saga and Two-Phase Commit', explanation: 'Saga coordinates local transactions with compensating rollbacks, while Two-Phase Commit secures distributed consistency.' }
      ],
      coding: [
        {
          id: 'c1',
          title: 'Eureka Discovery Client',
          description: 'Enable Eureka Client discovery on this Spring Boot main class.',
          starterCode: `import org.springframework.boot.autoconfigure.SpringBootApplication;

// TODO: Enable discovery client
@SpringBootApplication
public class UserServiceApp {
}`,
          solution: `import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableDiscoveryClient
@SpringBootApplication
public class UserServiceApp {
}`
        },
        {
          id: 'c2',
          title: 'Feign Client Declarator',
          description: 'Declare a Feign Client interface to call a remote service named "product-service".',
          starterCode: `import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

// TODO: Declare FeignClient for product-service
public interface ProductClient {
    @GetMapping("/api/products")
    String getProducts();
}`,
          solution: `import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "product-service")
public interface ProductClient {
    @GetMapping("/api/products")
    String getProducts();
}`
        },
        {
          id: 'c3',
          title: 'Circuit Breaker Annotator',
          description: 'Apply a Resilience4j CircuitBreaker with name "productService" and fallback method "fallbackProducts".',
          starterCode: `import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

public class CatalogService {
    // TODO: Add CircuitBreaker and Fallback definition
    public String getItems() {
        return "items";
    }
    
    public String fallbackProducts(Throwable t) {
        return "default items";
    }
}`,
          solution: `import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

public class CatalogService {
    @CircuitBreaker(name = "productService", fallbackMethod = "fallbackProducts")
    public String getItems() {
        // network call here
        return "items";
    }
    
    public String fallbackProducts(Throwable t) {
        return "default items";
    }
}`
        }
      ],
      scenario: [
        {
          id: 's1',
          question: "A payment microservice goes offline. The main order service hangs, exhausting container threads and crashing the system. How do you prevent this?",
          hint: "What pattern prevents failures from propagating upstream?",
          explanation: "This is a cascading failure. Protect downstream calls using a Circuit Breaker (like Resilience4j). Configure timeouts and define fallback methods to return cache data or generic responses."
        },
        {
          id: 's2',
          question: "You want to deploy multiple instances of your order microservice dynamically. How do client-side services call them without hardcoding IP addresses?",
          hint: "Think about Eureka and Load Balancers.",
          explanation: "Use Service Discovery (like Eureka) and client-side load balancing (like Spring Cloud LoadBalancer). Services call others using logical names (like http://order-service/api), letting the load balancer resolve active IPs."
        }
      ]
    },
    summary: "Microservices split applications into focused services. Implementing discovery registries, API gateways, circuit breakers, and async message queues creates resilient architectures."
  },
  {
    id: 11,
    slug: 'rest-api-development',
    title: 'REST API Development',
    difficulty: 'Advanced',
    duration: '100 mins',
    xp: 500,
    accent: '#10B981',
    icon: '🌐',
    description: 'Learn REST principles, designing CRUD endpoints, data validation, and global error handling.',
    topics: ['REST Principles', 'CRUD APIs', 'Validation', 'Error Handling'],
    architectExplain: {
      whyCompaniesUseIt: "Standardizes API design. Allows diverse clients (React, mobile apps) to communicate with backend services using HTTP protocols.",
      scalabilityImpact: "Stateless REST APIs can be scaled easily using load balancers because servers do not store client session state.",
      performanceImpact: "Serialization (Java objects to JSON) consumes CPU. Configure HTTP caching headers (ETag, Cache-Control) to reduce backend load.",
      realWorldExamples: "Payment gateways or SaaS platforms expose REST APIs to allow external developers to integrate with their systems.",
      decisions: "Use correct HTTP methods (GET, POST, PUT, DELETE) and return standard HTTP status codes. Handle exceptions globally using @ControllerAdvice."
    },
    script: [
      { type: 'intro', text: "Welcome to REST API Development. REST is an architectural style that uses standard HTTP methods to manage resources." },
      { type: 'concept', text: "REST principles require stateless requests, uniform interfaces, and using standard HTTP verbs: GET to read, POST to create, PUT to update, and DELETE to remove." },
      { type: 'code', text: "Look at this controller. We validate input payloads using @Valid annotations and handle validation errors globally." },
      { type: 'warn', text: "Warning: Never return raw database stack traces in API error responses. This exposes internal details and is a major security risk. Always wrap exceptions in clean response models." },
      { type: 'quiz', text: "Which HTTP status code should be returned when a resource is successfully created?" },
      { type: 'summary', text: "Excellent! You understand REST principles, designing endpoints, validating payloads, and handling exceptions globally." }
    ],
    codeExamples: [
      {
        title: 'Global Exception Handler',
        code: `import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        ErrorResponse err = new ErrorResponse("NOT_FOUND", ex.getMessage());
        return new ResponseEntity<>(err, HttpStatus.NOT_FOUND);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        ErrorResponse err = new ErrorResponse("VALIDATION_FAILED", "Invalid request body");
        return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
    }
}`,
        explanation: '@ControllerAdvice intercepts exceptions globally across all controllers, returning clean, standardized error JSON models.',
        output: '(handles exceptions globally, mapping them to HTTP status codes)'
      }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'What does REST stand for?', options: ['Representational State Transfer', 'Remote Enterprise Service Task', 'Registered Execution Session Table', 'Routing Encryption Security Utility'], correct: 'Representational State Transfer', explanation: 'REST stands for Representational State Transfer, representing resources as URIs.' },
        { id: 'q2', question: 'Which HTTP method should be idempotent?', options: ['POST', 'PUT', 'DELETE', 'Both PUT and DELETE'], correct: 'Both PUT and DELETE', explanation: 'Idempotency means multiple identical requests have the same effect as a single request. PUT and DELETE are idempotent, POST is not.' },
        { id: 'q3', question: 'Which HTTP status code represents a resource validation failure?', options: ['400 Bad Request', '404 Not Found', '500 Internal Server Error', '401 Unauthorized'], correct: '400 Bad Request', explanation: 'Return 400 Bad Request when the request payload is malformed or fails validation rules.' },
        { id: 'q4', question: 'Which annotation validates model fields in Spring Boot?', options: ['@NotNull', '@Size', '@Valid', 'All of the above'], correct: 'All of the above', explanation: 'Use validation constraints (@NotNull, @Size) on fields, and trigger validation in controllers using @Valid.' },
        { id: 'q5', question: 'Which annotation intercepts exceptions globally in Spring?', options: ['@ExceptionHandler', '@ControllerAdvice', '@ResponseStatus', '@Aspect'], correct: '@ControllerAdvice', explanation: '@ControllerAdvice registers interceptors to handle exceptions globally across all controllers.' },
        { id: 'q6', question: 'What is the purpose of HATEOAS in REST API design?', options: ['Encrypt responses', 'Provide links inside JSON responses to guide clients dynamically', 'Compress payloads', 'Manage logins'], correct: 'Provide links inside JSON responses to guide clients dynamically', explanation: 'HATEOAS provides links inside responses to guide clients to related resources dynamically.' },
        { id: 'q7', question: 'Which status code is returned for unauthenticated requests?', options: ['403 Forbidden', '401 Unauthorized', '400 Bad Request', '405 Method Not Allowed'], correct: '401 Unauthorized', explanation: '401 Unauthorized means the request lacks valid authentication credentials.' },
        { id: 'q8', question: 'Which status code is returned when a user has valid credentials but lacks roles to access a resource?', options: ['401 Unauthorized', '403 Forbidden', '404 Not Found', '400 Bad Request'], correct: '403 Forbidden', explanation: '403 Forbidden means the user is authenticated but does not have the required permissions.' },
        { id: 'q9', question: 'How can you pass parameters in a REST URL path?', options: ['Query parameters (?id=5)', 'Path variables (/users/{id})', 'Form parameters', 'Both Query parameters and Path variables'], correct: 'Both Query parameters and Path variables', explanation: 'Use Path variables for resource identifiers, and Query parameters for filtering and sorting.' },
        { id: 'q10', question: 'What is the main benefit of stateless REST APIs?', options: ['Easier debugging', 'Improves scalability since servers do not store client session states', 'Faster compiler runs', 'Simpler routing rules'], correct: 'Improves scalability since servers do not store client session states', explanation: 'Stateless servers do not store client session details, making them easy to scale behind load balancers.' }
      ],
      coding: [
        {
          id: 'c1',
          title: 'Model Validator',
          description: 'Add validation annotations to this User DTO to ensure email is not null and is a valid email format.',
          starterCode: `public class UserDto {
    // TODO: Add Validation annotations
    private String email;
}`,
          solution: `import javax.validation.constraints.Email;
import javax.validation.constraints.NotNull;

public class UserDto {
    @NotNull(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}`
        },
        {
          id: 'c2',
          title: 'Path Variable Endpoint',
          description: 'Write a GET controller endpoint at "/api/users/{id}" that extracts the ID path variable.',
          starterCode: `import org.springframework.web.bind.annotation.*;

@RestController
public class UserGetController {
    // TODO: Map GET path variable endpoint
}`,
          solution: `import org.springframework.web.bind.annotation.*;

@RestController
public class UserGetController {
    @GetMapping("/api/users/{id}")
    public String getUserById(@PathVariable("id") Long id) {
        return "User ID: " + id;
    }
}`
        },
        {
          id: 'c3',
          title: 'Custom Exception Class',
          description: 'Annotate a custom exception class so it automatically returns a 404 Not Found status code when thrown.',
          starterCode: `import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// TODO: Add ResponseStatus annotation
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }
}`,
          solution: `import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }
}`
        }
      ],
      scenario: [
        {
          id: 's1',
          question: "A client calls your API to update a user but gets a 400 Bad Request with no details. The logs show validation errors. How do you return validation details to the client?",
          hint: "Which exception is thrown during @Valid failures, and how do you handle it?",
          explanation: "Catch `MethodArgumentNotValidException` inside a `@ControllerAdvice` class. Extract errors from `BindingResult` and return them as a list of field names and error messages in a 400 Bad Request response."
        },
        {
          id: 's2',
          question: "You want to implement versioning for your REST API to prevent breaking changes for existing client applications. What versioning strategies can you use?",
          hint: "Think about URL paths, query parameters, and custom headers.",
          explanation: "Use URL path versioning (like `/api/v1/users`), query parameter versioning (like `/api/users?version=1`), or custom header versioning (like `Accept: application/vnd.company.v1+json`)."
        }
      ]
    },
    summary: "REST APIs standardize server-client communication. Implementing validations, using correct HTTP status codes, and managing errors globally simplifies client integration."
  },
  {
    id: 12,
    slug: 'maven-gradle',
    title: 'Maven & Gradle',
    difficulty: 'Intermediate',
    duration: '50 mins',
    xp: 200,
    accent: '#3B82F6',
    icon: '📦',
    description: 'Learn build automation tools: Maven POM models, Gradle build scripts, dependency management, and build lifecycles.',
    topics: ['Dependencies', 'Build Lifecycle', 'Plugins', 'Packaging'],
    architectExplain: {
      whyCompaniesUseIt: "Standardizes dependency management, automates compilation, executes tests, and packages projects into deployable files.",
      scalabilityImpact: "Dependency caching and parallel execution in Gradle improve build speeds, reducing CI/CD pipeline bottlenecks.",
      performanceImpact: "Unused dependencies bloat build sizes. Run dependency analysis plugins to detect and remove unused libraries.",
      realWorldExamples: "Enterprise development pipelines pull library dependencies from secure internal Nexus or Artifactory registries.",
      decisions: "Use Gradle for large multi-module builds to speed up builds. Exclude transitive dependency conflicts using build constraints."
    },
    script: [
      { type: 'intro', text: "Welcome to Maven & Gradle. Build tools automate the compilation, testing, dependency management, and packaging of Java applications." },
      { type: 'concept', text: "Maven uses XML-based `pom.xml` files with clean build phases (compile, test, package, install). Gradle uses Groovy or Kotlin build scripts." },
      { type: 'code', text: "Look at this Maven POM snippet. We declare external dependencies with group IDs, artifact IDs, and versions, and exclude conflicting transitive libraries." },
      { type: 'warn', text: "Warning: Avoid using dependency version ranges (like '[1.0, 2.0)') in production configurations. This makes builds unpredictable and hard to reproduce." },
      { type: 'quiz', text: "Which Maven build phase compiles the source code of the project?" },
      { type: 'summary', text: "Excellent! You understand POM configurations, build lifecycles, and dependency management in Maven and Gradle." }
    ],
    codeExamples: [
      {
        title: 'Maven pom.xml Dependency',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <version>2.7.5</version>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-logging</artifactId>
        </exclusion>
    </exclusions>
</dependency>`,
        explanation: 'Declares an external dependency in Maven. The <exclusions> tag removes transitive dependencies to prevent version conflicts.',
        output: '(declares Spring Web MVC starter dependency)'
      }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'What does POM stand for in Maven?', options: ['Project Object Model', 'Process Optimization Method', 'Program Output Manager', 'Portable Object Mapper'], correct: 'Project Object Model', explanation: 'POM stands for Project Object Model, defined in pom.xml to describe Maven projects.' },
        { id: 'q2', question: 'Which file contains the configuration for a Gradle build?', options: ['pom.xml', 'build.gradle or build.gradle.kts', 'settings.xml', 'gradle.properties'], correct: 'build.gradle or build.gradle.kts', explanation: 'build.gradle (using Groovy) or build.gradle.kts (using Kotlin) contains build configurations in Gradle.' },
        { id: 'q3', question: 'Which command compiles and packages a Maven project into a JAR file?', options: ['mvn compile', 'mvn clean package', 'mvn test', 'mvn install'], correct: 'mvn clean package', explanation: 'mvn package compiles, tests, and packages code into target formats (like JAR/WAR).' },
        { id: 'q4', question: 'What is a transitive dependency?', options: ['A dependency only used in tests', 'A dependency required by one of your direct dependencies', 'A database connection driver', 'A compiler plugin'], correct: 'A dependency required by one of your direct dependencies', explanation: 'Transitive dependencies are dependencies of dependencies, automatically resolved by Maven/Gradle.' },
        { id: 'q5', question: 'Which scope is used in Maven for dependencies required only during testing?', options: ['compile', 'provided', 'runtime', 'test'], correct: 'test', explanation: 'The test scope limits dependencies (like JUnit) to compilation and execution of tests.' },
        { id: 'q6', question: 'What is the default local repository folder for Maven?', options: ['/maven/repo', '~/.m2/repository', '/user/local/maven', '/bin/repo'], correct: '~/.m2/repository', explanation: 'Maven caches downloaded dependencies locally in the ~/.m2/repository directory.' },
        { id: 'q7', question: 'Which build tool uses a Directed Acyclic Graph (DAG) to determine task order?', options: ['Maven', 'Gradle', 'Ant', 'Make'], correct: 'Gradle', explanation: 'Gradle models builds as tasks in a Directed Acyclic Graph (DAG) to support parallel executions.' },
        { id: 'q8', question: 'How do you exclude a transitive dependency in Gradle?', options: ['<exclude> tag', 'exclude group: "group_name", module: "module_name"', 'delete dependency', 'scope exclusion'], correct: 'exclude group: "group_name", module: "module_name"', explanation: 'Use the exclude method on dependencies in build.gradle to block transitive imports.' },
        { id: 'q9', question: 'What is the purpose of the Maven wrapper?', options: ['Speed up downloads', 'Run Maven builds without pre-installing Maven globally on the host machine', 'Encrypt project code', 'Compile C++ dependencies'], correct: 'Run Maven builds without pre-installing Maven globally on the host machine', explanation: 'The Maven wrapper (mvnw) downloads and uses the correct Maven version automatically, making builds portable.' },
        { id: 'q10', question: 'Which phase in the Maven lifecycle installs packaged files into the local repository?', options: ['package', 'deploy', 'install', 'verify'], correct: 'install', explanation: 'The install phase copies the packaged JAR/WAR file into your local ~/.m2 cache directory.' }
      ],
      coding: [
        {
          id: 'c1',
          title: 'Maven Dependency Declaring',
          description: 'Construct a Maven dependency element for junit:junit:4.13.2 with test scope.',
          starterCode: `<!-- TODO: Add JUnit dependency with test scope -->
`,
          solution: `<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.13.2</version>
    <scope>test</scope>
</dependency>`
        },
        {
          id: 'c2',
          title: 'Gradle Implementation Dependency',
          description: 'Write a Gradle dependency declaration importing "org.springframework.boot:spring-boot-starter-web" in build.gradle.',
          starterCode: `dependencies {
    // TODO: Add implementation dependency
}`,
          solution: `dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
}`
        },
        {
          id: 'c3',
          title: 'Gradle Transitive Excluder',
          description: 'Exclude transitive dependency "log4j" from the "org.apache.poi:poi" dependency in build.gradle.',
          starterCode: `dependencies {
    implementation('org.apache.poi:poi:5.2.2') {
        // TODO: Exclude group "org.apache.logging.log4j"
    }
}`,
          solution: `dependencies {
    implementation('org.apache.poi:poi:5.2.2') {
        exclude group: 'org.apache.logging.log4j', module: 'log4j-api'
    }
}`
        }
      ],
      scenario: [
        {
          id: 's1',
          question: "Your project fails to build because two dependencies import conflicting versions of log4j. How do you diagnose and resolve this conflict in Maven?",
          hint: "Which maven command prints the dependency tree, and how do you exclude dependencies?",
          explanation: "Run `mvn dependency:tree` to find the conflicting dependencies. Exclude the incorrect version using the `<exclusions>` tag in the conflicting dependency definition."
        },
        {
          id: 's2',
          question: "You want to automate the release process in your CI/CD pipeline, building and uploading the JAR file to an internal Nexus repository. Which Maven phases do you use?",
          hint: "Think about build lifecycles.",
          explanation: "Configure the `<distributionManagement>` section in your `pom.xml`. Run `mvn clean deploy` in the pipeline to compile, test, package, and upload the artifact to the remote repository."
        }
      ]
    },
    summary: "Maven and Gradle automate the build lifecycle. Standardizing dependencies and configuring exclusions prevents version conflicts."
  },
  {
    id: 13,
    slug: 'design-patterns',
    title: 'Design Patterns',
    difficulty: 'Advanced',
    duration: '100 mins',
    xp: 500,
    accent: '#8B5CF6',
    icon: '🧩',
    description: 'Learn gang-of-four design patterns: Singleton, Factory, Builder, Observer, and Strategy.',
    topics: ['Singleton', 'Factory', 'Builder', 'Observer', 'Strategy'],
    architectExplain: {
      whyCompaniesUseIt: "Provides proven templates to solve common software design challenges, making code reusable and maintainable.",
      scalabilityImpact: "Applying standard patterns ensures decoupled class hierarchies, allowing developers to refactor sub-components without breaking APIs.",
      performanceImpact: "Incorrect Singleton implementations can create synchronization bottle-necks. Use double-checked locking or bill pugh models to improve speed.",
      realWorldExamples: "Spring Framework uses the Factory pattern for bean instantiation and the Template pattern for JDBC operations.",
      decisions: "Prefer composition over inheritance. Use the Builder pattern when constructor parameter lists exceed four fields."
    },
    script: [
      { type: 'intro', text: "Welcome to Design Patterns. Design patterns are reusable solutions to common software development problems." },
      { type: 'concept', text: "We categorize patterns: Creational (Singleton, Builder, Factory), Structural (Adapter, Proxy), and Behavioral (Observer, Strategy)." },
      { type: 'code', text: "Look at this Builder pattern implementation. It provides a clean, step-by-step API to construct complex objects without messy constructors." },
      { type: 'warn', text: "Warning: Implementing Singleton incorrectly can create thread-safety bugs. Always use the Double-Checked Locking pattern or a private helper class (Bill Pugh Singleton)." },
      { type: 'quiz', text: "Which design pattern defines a family of algorithms, encapsulating each one, and making them interchangeable at runtime?" },
      { type: 'summary', text: "Excellent! You understand creational, structural, and behavioral design patterns in Java." }
    ],
    codeExamples: [
      {
        title: 'Builder Design Pattern',
        code: `public class Customer {
    private final String firstName;
    private final String lastName;
    private final String email;
    
    private Customer(Builder builder) {
        this.firstName = builder.firstName;
        this.lastName = builder.lastName;
        this.email = builder.email;
    }
    
    public static class Builder {
        private String firstName;
        private String lastName;
        private String email;
        
        public Builder firstName(String fn) { this.firstName = fn; return this; }
        public Builder lastName(String ln) { this.lastName = ln; return this; }
        public Builder email(String em) { this.email = em; return this; }
        
        public Customer build() {
            return new Customer(this);
        }
    }
}`,
        explanation: 'The Builder pattern separates construction from representation, avoiding long constructor parameter lists and making code more readable.',
        output: '(defines a client-built class constructor)'
      }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'Which design pattern restricts a class to a single instance?', options: ['Factory', 'Singleton', 'Builder', 'Prototype'], correct: 'Singleton', explanation: 'Singleton pattern ensures a class has only one instance and provides a global access point to it.' },
        { id: 'q2', question: 'Which pattern is best for constructing complex objects step-by-step?', options: ['Singleton', 'Builder', 'Factory Method', 'Strategy'], correct: 'Builder', explanation: 'Builder pattern provides a clear API to construct complex objects step-by-step.' },
        { id: 'q3', question: 'Which pattern encapsulates algorithms, making them interchangeable?', options: ['Observer', 'Strategy', 'Factory', 'Decorator'], correct: 'Strategy', explanation: 'Strategy pattern defines a family of algorithms, encapsulating each one, and making them interchangeable at runtime.' },
        { id: 'q4', question: 'Which pattern notifies multiple observers when a state changes?', options: ['Strategy', 'Observer', 'Builder', 'Adapter'], correct: 'Observer', explanation: 'Observer pattern defines a one-to-many dependency so that when one object changes state, observers are notified.' },
        { id: 'q5', question: 'What is the Bill Pugh Singleton implementation?', options: ['Using synchronized methods', 'Using a private static helper class to load the singleton instance lazily', 'Using enum values', 'Creating instances in static blocks'], correct: 'Using a private static helper class to load the singleton instance lazily', explanation: 'The Bill Pugh Singleton uses a helper class to load instances lazily and safely without synchronization overhead.' },
        { id: 'q6', question: 'Which pattern acts as a wrapper to convert one interface to another?', options: ['Facade', 'Adapter', 'Proxy', 'Bridge'], correct: 'Adapter', explanation: 'Adapter pattern allows classes with incompatible interfaces to work together.' },
        { id: 'q7', question: 'What is the main benefit of the Factory Pattern?', options: ['Enforces serialization', 'Decouples object instantiation logic from client applications', 'Saves memory', 'Improves class execution speed'], correct: 'Decouples object instantiation logic from client applications', explanation: 'Factory patterns delegate instantiation details to factory methods, decoupling client code.' },
        { id: 'q8', question: 'What is double-checked locking?', options: ['Checking a lock twice in a synchronized block before instantiating a Singleton instance', 'Running unit tests twice', 'Using two databases', 'Two-phase transaction commits'], correct: 'Checking a lock twice in a synchronized block before instantiating a Singleton instance', explanation: 'Double-checked locking checks the instance variable twice with synchronization to avoid instantiation overhead.' },
        { id: 'q9', question: 'Which pattern controls access to an object by acting as a placeholder?', options: ['Proxy', 'Facade', 'Composite', 'Decorator'], correct: 'Proxy', explanation: 'Proxy pattern provides a placeholder or surrogate object to control access to the real object.' },
        { id: 'q10', question: 'Which pattern dynamically adds responsibilities to an object without sub-classing?', options: ['Adapter', 'Decorator', 'Strategy', 'Observer'], correct: 'Decorator', explanation: 'Decorator pattern dynamically wraps objects to extend functionality without inheritance.' }
      ],
      coding: [
        {
          id: 'c1',
          title: 'Singleton Builder',
          description: 'Implement a thread-safe lazy Singleton using double-checked locking.',
          starterCode: `public class DatabaseConnection {
    private static DatabaseConnection instance;
    
    private DatabaseConnection() {}
    
    public static DatabaseConnection getInstance() {
        // TODO: Implement double-checked locking
        return null;
    }
}`,
          solution: `public class DatabaseConnection {
    private static volatile DatabaseConnection instance;
    
    private DatabaseConnection() {}
    
    public static DatabaseConnection getInstance() {
        if (instance == null) {
            synchronized (DatabaseConnection.class) {
                if (instance == null) {
                    instance = new DatabaseConnection();
                }
            }
        }
        return instance;
    }
}`
        },
        {
          id: 'c2',
          title: 'Strategy Pattern Implementation',
          description: 'Implement a Strategy interface PaymentStrategy with a method pay(double amount).',
          starterCode: `// TODO: Define PaymentStrategy interface and CreditCardPayment class
`,
          solution: `public interface PaymentStrategy {
    void pay(double amount);
}

public class CreditCardPayment implements PaymentStrategy {
    private String cardNumber;
    
    public CreditCardPayment(String cardNumber) {
        this.cardNumber = cardNumber;
    }
    
    @Override
    public void pay(double amount) {
        System.out.println("Paid " + amount + " using Credit Card");
    }
}`
        },
        {
          id: 'c3',
          title: 'Factory Creator Method',
          description: 'Create a simple Factory class ShapeFactory that returns a Shape based on a parameter.',
          starterCode: `interface Shape { void draw(); }
class Circle implements Shape { public void draw() {} }
class Square implements Shape { public void draw() {} }

public class ShapeFactory {
    public Shape getShape(String shapeType) {
        // TODO: Return Circle or Square based on shapeType
        return null;
    }
}`,
          solution: `interface Shape { void draw(); }
class Circle implements Shape { public void draw() {} }
class Square implements Shape { public void draw() {} }

public class ShapeFactory {
    public Shape getShape(String shapeType) {
        if (shapeType == null) return null;
        if (shapeType.equalsIgnoreCase("CIRCLE")) return new Circle();
        if (shapeType.equalsIgnoreCase("SQUARE")) return new Square();
        return null;
    }
}`
        }
      ],
      scenario: [
        {
          id: 's1',
          question: "You want to implement a logger class that is accessed by multiple threads. An engineer suggests a lazy Singleton with a `synchronized` keyword on the `getInstance()` method. What is the performance impact?",
          hint: "Does every read access need to be synchronized?",
          explanation: "Synchronizing the entire method causes severe bottlenecks because every read access must wait for the lock. Optimize this using Double-Checked Locking with a volatile instance or use the Bill Pugh helper class model."
        },
        {
          id: 's2',
          question: "Your system needs to process notifications via Email, SMS, and Push. You want to add new notification channels in the future without modifying the core business controllers. Which pattern fits?",
          hint: "Think about Strategy and Factory patterns.",
          explanation: "Define a `NotificationStrategy` interface. Implement specific channels (Email, SMS) in separate classes. Create a `NotificationFactory` to resolve the correct strategy at runtime. This keeps business classes decoupled."
        }
      ]
    },
    summary: "Design patterns offer templates to solve common challenges. Applying Singleton, Builder, Factory, and Strategy decoupling interfaces keeps systems modular."
  },
  {
    id: 14,
    slug: 'multithreading',
    title: 'Multithreading',
    difficulty: 'Advanced',
    duration: '100 mins',
    xp: 500,
    accent: '#3B82F6',
    icon: '🧵',
    description: 'Learn Java concurrency: thread states, synchronization blocks, executors, and avoiding deadlocks.',
    topics: ['Threads', 'Executors', 'Synchronization', 'Deadlocks'],
    architectExplain: {
      whyCompaniesUseIt: "Maximizes CPU utilization, allowing systems to handle multiple business tasks in parallel.",
      scalabilityImpact: "Spawning threads manually can exhaust server resources. Use thread pools (ExecutorService) to manage thread limits.",
      performanceImpact: "Thread contention and excessive synchronization reduce throughput. Use lock-free data structures (ConcurrentHashMap) where possible.",
      realWorldExamples: "High-throughput search engines run parallel index crawler workers in ExecutorService thread pools.",
      decisions: "Always configure thread pool bounds. Never spawn unchecked threads in web application requests."
    },
    script: [
      { type: 'intro', text: "Welcome to Multithreading. Concurrency allows a program to execute multiple threads of execution in parallel." },
      { type: 'concept', text: "We manage threads using the ExecutorService API instead of spawning threads manually. Synchronization protects shared resources from concurrent modifications." },
      { type: 'code', text: "Look at this ExecutorService demo. We submit multiple tasks to a fixed thread pool and wait for all tasks to complete." },
      { type: 'warn', text: "Warning: Deadlocks happen when two threads are blocked forever, each waiting for locks held by the other. Always acquire locks in a consistent order to prevent deadlocks." },
      { type: 'quiz', text: "Which interface should you implement to define a task that returns a value and can throw checked exceptions?" },
      { type: 'summary', text: "Excellent! You understand Java concurrency, synchronization, thread pools, and deadlock prevention." }
    ],
    codeExamples: [
      {
        title: 'ExecutorService Pool',
        code: `import java.util.concurrent.*;

public class ConcurrencyDemo {
    public static void main(String[] args) throws InterruptedException, ExecutionException {
        ExecutorService executor = Executors.newFixedThreadPool(3);
        
        Callable<String> task = () -> {
            Thread.sleep(1000);
            return "Task completed by " + Thread.currentThread().getName();
        };
        
        Future<String> future = executor.submit(task);
        
        // Non-blocking work here...
        
        System.out.println(future.get()); // Blocks until result is ready
        executor.shutdown();
    }
}`,
        explanation: 'ExecutorService manages a pool of worker threads. Future.get() blocks execution until the thread returns the computed value.',
        output: 'Task completed by pool-1-thread-1'
      }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'How do you instantiate a thread in Java?', options: ['Extending Thread class', 'Implementing Runnable interface', 'Using ExecutorService', 'All of the above'], correct: 'All of the above', explanation: 'Threads can be created by subclassing Thread, implementing Runnable, or using Executors.' },
        { id: 'q2', question: 'What is the purpose of the synchronized keyword?', options: ['Speeds up execution', 'Restricts access to a block or method to a single thread at a time', 'Enforces serialization', 'Bypasses compile errors'], correct: 'Restricts access to a block or method to a single thread at a time', explanation: 'Synchronization prevents thread interference and race conditions on shared memory.' },
        { id: 'q3', question: 'Which thread pool executor reuse a fixed number of threads?', options: ['newCachedThreadPool', 'newSingleThreadExecutor', 'newFixedThreadPool', 'newScheduledThreadPool'], correct: 'newFixedThreadPool', explanation: 'newFixedThreadPool creates a pool of fixed size, queueing extra tasks in a LinkedBlockingQueue.' },
        { id: 'q4', question: 'What does Future.get() do?', options: ['Cancels task execution', 'Blocks the calling thread until the concurrent task completes and returns its result', 'Spawns a new JVM thread', 'Cleans memory'], correct: 'Blocks the calling thread until the concurrent task completes and returns its result', explanation: 'Future.get() waits for the background execution to complete, returning the result or throwing exceptions.' },
        { id: 'q5', question: 'What is a deadlock?', options: ['A compilation error', 'A situation where two or more threads are blocked forever, each waiting for locks held by the other', 'Exhausting database connections', 'An infinite loop'], correct: 'A situation where two or more threads are blocked forever, each waiting for locks held by the other', explanation: 'Deadlocks lock threads indefinitely because they wait for resources locked by other threads.' },
        { id: 'q6', question: 'Which class is a thread-safe replacement for HashMap?', options: ['Hashtable', 'ConcurrentHashMap', 'SynchronizedMap', 'TreeHashMap'], correct: 'ConcurrentHashMap', explanation: 'ConcurrentHashMap allows parallel reads and thread-safe writes using segment locks, avoiding full map locks.' },
        { id: 'q7', question: 'What does the volatile keyword guarantee?', options: ['Thread safety', 'Visibility of variable changes across threads by reading directly from main memory', 'Atomicity of operations', 'Lock execution'], correct: 'Visibility of variable changes across threads by reading directly from main memory', explanation: 'Volatile variables are read/written directly to main memory, avoiding CPU cache inconsistency.' },
        { id: 'q8', question: 'Which lock class allows separating read locks from write locks?', options: ['ReentrantLock', 'ReentrantReadWriteLock', 'StampedLock', 'Semaphore'], correct: 'ReentrantReadWriteLock', explanation: 'ReentrantReadWriteLock permits multiple concurrent readers but serializes writers, improving read performance.' },
        { id: 'q9', question: 'What does Thread.sleep() do?', options: ['Kills the thread', 'Suspends thread execution for a specified duration without losing lock ownership', 'Closes sockets', 'Garbage collects objects'], correct: 'Suspends thread execution for a specified duration without losing lock ownership', explanation: 'Sleep pauses execution without releasing synchronized locks held by the thread.' },
        { id: 'q10', question: 'Which concurrency utility manages a set of threads waiting for a countdown to reach zero?', options: ['CountDownLatch', 'CyclicBarrier', 'Phaser', 'Semaphore'], correct: 'CountDownLatch', explanation: 'CountDownLatch blocks threads until counter operations decrement the count to zero.' }
      ],
      coding: [
        {
          id: 'c1',
          title: 'Thread Runnable Instantiator',
          description: 'Spawn a new thread in Java using a Runnable lambda that prints "RUN".',
          starterCode: `public class ThreadRunner {
    public static void runThread() {
        // TODO: Create a Thread with a runnable lambda and start it
    }
}`,
          solution: `public class ThreadRunner {
    public static void runThread() {
        Thread t = new Thread(() -> System.out.println("RUN"));
        t.start();
    }
}`
        },
        {
          id: 'c2',
          title: 'Fixed Pool Submitter',
          description: 'Submit a Callable task returning the string "RESULT" to an ExecutorService.',
          starterCode: `import java.util.concurrent.*;

public class PoolSubmitter {
    public Future<String> submitTask(ExecutorService executor) {
        // TODO: Submit callable returning "RESULT"
        return null;
    }
}`,
          solution: `import java.util.concurrent.*;

public class PoolSubmitter {
    public Future<String> submitTask(ExecutorService executor) {
        return executor.submit(() -> "RESULT");
    }
}`
        },
        {
          id: 'c3',
          title: 'Atomic Integer Incrementor',
          description: 'Use an AtomicInteger parameter to safely increment a count variable without locks.',
          starterCode: `import java.util.concurrent.atomic.AtomicInteger;

public class SafeCounter {
    private AtomicInteger count = new AtomicInteger(0);
    
    public void increment() {
        // TODO: Increment atomically
    }
}`,
          solution: `import java.util.concurrent.atomic.AtomicInteger;

public class SafeCounter {
    private AtomicInteger count = new AtomicInteger(0);
    
    public void increment() {
        count.incrementAndGet();
    }
}`
        }
      ],
      scenario: [
        {
          id: 's1',
          question: "An application counts API hits in a multi-threaded servlet using a simple class variable `private int count = 0;`. Under heavy load, the final counts are lower than actual hits. Why?",
          hint: "Is incrementing count thread-safe?",
          explanation: "The increment operation `count++` is not atomic; it consists of read, update, and write operations. Under concurrent loads, threads overwrite each other's increments. Fix this using `AtomicInteger` or sync blocks."
        },
        {
          id: 's2',
          question: "You want to process 1,000 files in parallel. A junior developer writes a loop spawning 1,000 Thread instances. What is the architectural issue, and how do you resolve it?",
          hint: "Think about thread creation overhead and system limits.",
          explanation: "Spawning 1,000 threads consumes huge memory and causes slow context switching. Resolve this by using a fixed thread pool (e.g. `Executors.newFixedThreadPool(10)`) to process files concurrently."
        }
      ]
    },
    summary: "Java concurrency allows parallel execution. Managing threads via ExecutorService, using atomic structures, and acquiring locks consistently avoids deadlocks."
  },
  {
    id: 15,
    slug: 'enterprise-project',
    title: 'Enterprise Project',
    difficulty: 'Expert',
    duration: '180 mins',
    xp: 1000,
    accent: '#F59E0B',
    icon: '🏆',
    description: 'Integrate Spring Boot, Hibernate, Spring Security, JWT, and databases into a production-ready application.',
    topics: ['Spring Boot', 'Hibernate', 'Security', 'JWT', 'MySQL', 'Deployment'],
    architectExplain: {
      whyCompaniesUseIt: "Combines multiple frameworks into a complete, secure, and production-ready enterprise application architecture.",
      scalabilityImpact: "Applying microservices-ready layouts allows scaling individual layers (database, security, gateway) independently.",
      performanceImpact: "Implementing secondary caches, indexing query tables, and profiling thread pools ensures high-concurrency performance.",
      realWorldExamples: "Modern banking backends integrate Spring Boot, JPA/Hibernate, stateless JWT authentication, and secure transactional databases.",
      decisions: "Ensure comprehensive integration test coverage. Secure databases behind private subnetworks and use HTTPS for all communications."
    },
    script: [
      { type: 'intro', text: "Welcome to the Enterprise Project. This capstone lesson integrates Spring Boot, Hibernate, Security, JWT, and databases into a complete application." },
      { type: 'concept', text: "We build a secure REST service with database mapping, transaction validation, role-based access, and clean exception handling." },
      { type: 'code', text: "Look at the complete setup: mapping entities, configuring security, verifying tokens, and writing JUnit integration tests." },
      { type: 'warn', text: "Crucial Advice: Keep security rules simple and readable. Complicated filters can introduce vulnerabilities or block legitimate traffic." },
      { type: 'quiz', text: "Which testing annotation starts a full web container for integration tests in Spring Boot?" },
      { type: 'summary', text: "Congratulations! You have completed the Advanced Java course. You are now equipped to build secure, scalable enterprise applications." }
    ],
    codeExamples: [
      {
        title: 'Full Integration Controller',
        code: `import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import javax.validation.Valid;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;
    
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }
    
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public Order createOrder(@Valid @RequestBody OrderDto dto) {
        return orderService.processOrder(dto);
    }
}`,
        explanation: 'Combines REST API design, validation, method security roles, and transactional database mapping.',
        output: '(processes user orders and returns JSON responses)'
      }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'Which annotation starts a full integration test environment in Spring Boot?', options: ['@WebMvcTest', '@SpringBootTest', '@DataJpaTest', '@ContextConfiguration'], correct: '@SpringBootTest', explanation: '@SpringBootTest starts the entire application context and container for integration tests.' },
        { id: 'q2', question: 'How is transactional consistency ensured across operations in JPA?', options: ['Using synchronized methods', 'Adding @Transactional annotations', 'Manually locking databases', 'Recompiling Java classes'], correct: '@Transactional', explanation: '@Transactional delegates database transaction management (commit/rollback) to Spring AOP.' },
        { id: 'q3', question: 'Where should you configure the database connection URL in Spring Boot?', options: ['web.xml', 'application.properties/yml', 'pom.xml', 'context.xml'], correct: 'application.properties/yml', explanation: 'Spring Boot resolves database connections from properties configured in application.properties/yml.' },
        { id: 'q4', question: 'What is the purpose of JWT token authentication?', options: ['Speed up queries', 'Allow stateless, decentralized user authentication', 'Encrypt database columns', 'Compress responses'], correct: 'Allow stateless, decentralized user authentication', explanation: 'JWT allows servers to verify authentication claims without storing session state in memory.' },
        { id: 'q5', question: 'Which class registers method security in Spring Security?', options: ['WebSecurityConfigurerAdapter', 'SecurityContextHolder', '@EnableGlobalMethodSecurity', 'OncePerRequestFilter'], correct: '@EnableGlobalMethodSecurity', explanation: '@EnableGlobalMethodSecurity enables method-level security checks like @PreAuthorize.' },
        { id: 'q6', question: 'How do you handle validation exceptions globally?', options: ['Using @ControllerAdvice with an @ExceptionHandler method', 'Using try-catch in every controller', 'Ignoring errors', 'Throwing RuntimeExceptions'], correct: 'Using @ControllerAdvice with an @ExceptionHandler method', explanation: '@ControllerAdvice intercepts validation exceptions globally, returning clean error responses.' },
        { id: 'q7', question: 'Which HTTP method is best for creating new resources?', options: ['GET', 'POST', 'PUT', 'DELETE'], correct: 'POST', explanation: 'POST is the standard method to submit data for creating new resources.' },
        { id: 'q8', question: 'What is the benefit of database connection pooling?', options: ['Better encryption', 'Reusing connection instances to reduce handshake costs', 'Increasing heap size', 'Simplifying queries'], correct: 'Reusing connection instances to reduce handshake costs', explanation: 'Pooling avoids recreating database connections for every request, improving performance.' },
        { id: 'q9', question: 'How are passwords secured in databases?', options: ['Encrypted with Base64', 'Hashed using BCrypt', 'Stored in plain text', 'Saved in cookies'], correct: 'Hashed using BCrypt', explanation: 'Never store plain text or simple hashes. Use BCrypt to hash passwords with salt values.' },
        { id: 'q10', question: 'Which tool packages Spring Boot projects into executable JARs?', options: ['JUnit', 'Spring Boot Maven Plugin', 'Tomcat', 'Actuator'], correct: 'Spring Boot Maven Plugin', explanation: 'The Spring Boot Maven/Gradle plugin bundles all dependencies and code into a single executable fat JAR.' }
      ],
      coding: [
        {
          id: 'c1',
          title: 'Transactional Save Service',
          description: 'Annotate a service method as Transactional to ensure consistent database commits.',
          starterCode: `import org.springframework.stereotype.Service;

@Service
public class OrderService {
    // TODO: Add transactional annotation
    public void saveOrder(Order order) {
        // save logic
    }
}`,
          solution: `import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {
    @Transactional
    public void saveOrder(Order order) {
        // save logic
    }
}`
        },
        {
          id: 'c2',
          title: 'Security Context User Getter',
          description: 'Retrieve the authenticated user principal from the Spring SecurityContextHolder.',
          starterCode: `import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {
    public static String getAuthenticatedUser() {
        // TODO: Retrieve username principal
        return null;
    }
}`,
          solution: `import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

public class SecurityUtils {
    public static String getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        return principal.toString();
    }
}`
        },
        {
          id: 'c3',
          title: 'Integration Test Setup',
          description: 'Annotate a class as a Spring Boot integration test running on a random port.',
          starterCode: `// TODO: Add SpringBootTest annotation with random port webEnvironment
public class ApplicationTests {
}`,
          solution: `import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class ApplicationTests {
    @Test
    public void contextLoads() {}
}`
        }
      ],
      scenario: [
        {
          id: 's1',
          question: "During user creation, saving to the database succeeds, but mailing the confirmation fails. The database is left with orphaned records. How do you resolve this transaction issue?",
          hint: "Think about transaction boundaries and rolling back database operations.",
          explanation: "Annotate the creation service method with `@Transactional`. When mail delivery fails and throws an exception, Spring intercepts this and rolls back the database operation, ensuring consistency."
        },
        {
          id: 's2',
          question: "Your secure REST API gets a latency spike during peak loads. Profiling shows that verifying BCrypt hashes for incoming JWT tokens on every API call is consuming 80% CPU. How do you fix it?",
          hint: "Does verifying JWT signatures require checking BCrypt hashes?",
          explanation: "JWT signatures are verified using cryptographic keys (like HMAC or RSA), which is fast. Do not run BCrypt hashing on every request. Hashing should only run during login requests when users submit raw passwords."
        }
      ]
    },
    summary: "The Enterprise Project integrates multiple frameworks. Ensuring transaction consistency, configuring stateless JWT access, and writing integration tests builds robust systems."
  }
];
