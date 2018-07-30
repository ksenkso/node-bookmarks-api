

const Dashboard = function(req, res){
	return res.json({success:true, message:'it worked', data:'user name is :'});
};
module.exports.Dashboard = Dashboard;
