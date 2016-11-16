import Device from 'ismobilejs';

export default function maxRecommendedTextures(max)
{
    if (Device.tablet || Device.phone)
    {
        // check if the res is iphone 6 or higher..
        return 4;
    }

    // desktop should be ok
    return max;
}
