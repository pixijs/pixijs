

var  Device = require('ismobilejs');

var maxRecommendedTextures = function(max)
{

	if(Device.tablet || Device.phone)
	{
		// check if the res is iphone 6 or higher..
		return 2;
	}
	else
	{
		// desktop should be ok
		return max;
	}
};

module.exports = maxRecommendedTextures;