
var Navbar = ReactBootstrap.Navbar,
    Nav  = ReactBootstrap.Nav,
    NavItem  = ReactBootstrap.NavItem,
    NavDropdown  = ReactBootstrap.NavDropdown,
    MenuItem  = ReactBootstrap.MenuItem,
    ButtonGroup = ReactBootstrap.ButtonGroup,
    Button  = ReactBootstrap.Button,
    Input = ReactBootstrap.Input,
    Alert = ReactBootstrap.Alert,
    Table = ReactBootstrap.Table;

var nameApp = 'AngelAppBaseEx'; // Name app for created in appbase.io
var userName = "CoJNVLrNB"; // Your credential username
var passwd = "f449631d-30e9-47bd-8589-16cfbb3c06a0"; //Your credential password

var appbaseRef = new Appbase({
  url: 'https://scalr.api.appbase.io',
  appname: nameApp,
  username: userName,
  password: passwd
});

var AppBaseUtils = function(){
  this.capitalize = function(str){
      return str.replace(/\w\S*/g, function(txt){
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  };
}
var utils = new AppBaseUtils(); 

var JobBox = React.createClass({
  loadJobsFromServer: function() {    
    var objFather = this;
  },
  getInitialState: function() {
    return {data: [],alertVisible: false, msgAlert: "", typeAlert: "success"};
  },
  handleJobSubmit: function(job){
    var objThis = this;
    var jobs = this.state.data;
    if(jobs ==null || (jobs!=null && jobs.length==0)){
      jobs = this.state[0];      
    }
    if (!job.country || !job.city) {  
      this.setState({alertVisible: true, typeAlert: "warning", msgAlert: "Please complete the country and city!"});    
      return;
    }
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: job,
      success: function(data) {
        
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });

    console.log(job);
    appbaseRef.search({
        type: 'job',
        body: {
           query: {    
              bool: {
                    must: [
                        {
                          term: {
                            country_code: job.country
                          }
                        },
                        {
                          match: {
                            location: job.city
                          }
                        }
                    ]
                }    
            }
        }
    }).on('data', function(opr, err) {   
      console.log(opr);       
      objThis.setState({data: [opr],alertVisible: true, typeAlert: "success", msgAlert: "Operation executed success!"});
    }).on('error', function(err) {
      console.log("caught a stream error", err);
      objThis.setState({alertVisible: true, typeAlert: "warning", msgAlert: "Error to search."});
    }); 
  },
  handleEmailSubmit: function(mail){
    if (!mail.email) {  
      this.setState({alertVisible: true, typeAlert: "warning", msgAlert: "Email is not empty!"});    
      return;
    }
    var objCreated = {           
      type: "email",
      id: mail.email,
      body: {
        email: mail.email            
      }
    };  
    var objJobBox = this;
    appbaseRef.index(objCreated).on('data', function(res) {
        if(res.created){
          console.log(res);
          objJobBox.setState({alertVisible: true, typeAlert: "success", msgAlert: "Email registered successfully"});          
        }else{
          objJobBox.setState({alertVisible: true, typeAlert: "info", msgAlert: "E-mail is already in our database!"});
        }       
    }).on('error', function(err) {
        console.log(err);
        objJobBox.setState({alertVisible: true, typeAlert: "warning", msgAlert: "Error registering email."});        
    });
  },
  componentDidMount: function() {
    this.loadJobsFromServer();    
  },
  render: function() {  	 
  	 var valueState = (this.state.data instanceof Array)?this.state.data:JSON.parse(this.state.data);    
    return (
      
      <div className="jobBox">
      <ABNavBar />
        <h1>Search Jobs</h1>
        <AlertAngel onBoundState = {this.state} />
        <JobMailForm onJoinMailSubmit={this.handleEmailSubmit} />
        <JobForm onSearchJobSubmit={this.handleJobSubmit} />
        <br />
        <JobsList data={valueState} />
      </div>
    );
  }
});


var JobsList = React.createClass({
  render: function() {    
    var jobNodes = this.props.data;
    if(jobNodes!=null && jobNodes.length>0){
      var jobNodes = jobNodes[0].hits.hits.map(function(varJob) {
        return (
          <Job title={varJob._source.title} 
          job_type = {varJob._source.job_type} 
          url={varJob._source.angellist_url} 
          key={varJob._id}  
          location={utils.capitalize(varJob._source.location)}
          prop_key={varJob._id}   
          role={varJob._source.role_tag}/>
        );
      });
    }
    return (
      <div className="jobList">
       <Table striped bordered condensed hover>
          <thead>
            <tr>
              <th>Code</th>
              <th>Location</th>
              <th>Title Job</th>
              <th>Role</th>
              <th>Job Type</th>
              <th>Url</th>
            </tr>
          </thead>
          <tbody>
            {jobNodes}
          </tbody>
        </Table>
      </div>
    );
  }
});

var Job = React.createClass({
  rawMarkup: function() { 
    if(this.props.children!=null){
      var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    }else{
      var rawMarkup = marked(this.toString(), {sanitize: true});
    }
    return { __html: rawMarkup };
  },

  render: function() {
    return (
      <tr className="job">
        <td>{this.props.prop_key}</td>
        <td>{this.props.location}</td>
        <td>{this.props.title}</td>
        <td>{this.props.role}</td>        
        <td>{this.props.job_type}</td>        
        <td>{this.props.url}</td>
      </tr>       
    );
  }
});

var JobForm = React.createClass({
  
  getInitialState: function() {
    return {country: '', city: ''};
  },
  handleCountryChange: function(e) {
    this.setState({country: e.target.value});
  },
  handleCityChange: function(e) {
    this.setState({city: e.target.value});
  },  
  handleSubmit: function(e) {
    e.preventDefault();
    var country = this.state.country.trim();
    var city = this.state.city.trim();   
    this.props.onSearchJobSubmit({country: country, city: city});
    this.setState({country: '', city: ''});
  },
  render: function() {
    return (
      <form className="jobForm" onSubmit={this.handleSubmit}>
      <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              <a href="#">Values:</a>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Navbar.Form pullLeft>
              <Input
                  type="text"
                  placeholder="Country Code"
                  validations="isNumeric"
                  value={this.state.country}
                  onChange={this.handleCountryChange}
                />
                <Input
                    type="text"
                    placeholder="City"
                    value={this.state.city}
                    onChange={this.handleCityChange}
                  />                 
              <Button type="submit">Search</Button>              
            </Navbar.Form>
          </Navbar.Collapse>
      </Navbar>    
    </form>
    );
  }
});

var JobMailForm = React.createClass({
  
  getInitialState: function() {
    return {email: ''};
  },  
  handleEmailChange: function(e) {
    this.setState({email: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();   
    var email = this.state.email.trim();   
    this.props.onJoinMailSubmit({email: email});
    this.setState({email: ''});
  },
  render: function() {
    return (
      <form className="jobMailForm" onSubmit={this.handleSubmit}>
      <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              <a href="#">Register your email to receive updates:</a>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Navbar.Form pullLeft>              
                  <Input
                    type="text"
                    validations="isEmail"
                    validationError="This is not a valid email"
                    placeholder="E-mail"
                    value={this.state.email}
                    onChange={this.handleEmailChange}
                  />
              <Button type="submit">Join it</Button>              
            </Navbar.Form>
          </Navbar.Collapse>
      </Navbar>    
    </form>
    );
  }
});


var ABNavBar = React.createClass({
    render: function() {        
        return (<div>
                   <Navbar inverse>
                      <Navbar.Header>
                        <Navbar.Brand>
                          <a href="#">AngelAppBase</a>
                        </Navbar.Brand>
                        <Navbar.Toggle />
                      </Navbar.Header>
                      <Navbar.Collapse>
                        <Nav>
                          <NavItem eventKey={1} href="">Home</NavItem>                         
                        </Nav>
                        <Nav pullRight>
                         
                        </Nav>
                      </Navbar.Collapse>
                    </Navbar>
                </div>);
    }
});


var AlertAngel = React.createClass({
  getInitialState: function() {
    return ({alertVisible: false})
  },
  render: function() {
    var onBoundState = this.props.onBoundState;
    if (onBoundState.alertVisible) {
      return (
        <Alert bsStyle={onBoundState.typeAlert} onDismiss={this.handleAlertDismiss} dismissAfter={5000}>
          <h4>{utils.capitalize(onBoundState.typeAlert)}!</h4>
          <p>{onBoundState.msgAlert}</p>
        </Alert>
      );
    }
    return (<label />);
  },

  handleAlertDismiss: function() {
    this.props.onBoundState.alertVisible = false;
    this.setState({alertVisible: false});
  },

  handleAlertShow: function() {
    this.props.onBoundState.alertVisible = true;
    this.setState({alertVisible: true});
  }
});


React.render(
<JobBox url="/api/regcountry"/>,
document.getElementById('content')
);