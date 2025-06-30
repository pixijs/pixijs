window.onload = () =>
{
    /*
     * To ensure that users notice the advanced settings, we will automatically open the accordion for the settings panel
     * if it has not been opened by the user yet.
     */

    // get local storage value
    const hasToggle = localStorage.getItem('tsd-accordion-settings');

    // if it does not exist, create it
    if (hasToggle === null)
    {
        localStorage.setItem('tsd-accordion-settings', 'true');
    }

    // set the data attribute for the accordion
    const panel = document.querySelector('.tsd-navigation.settings');
    const accordion = panel ? panel.querySelector('.tsd-accordion') : null;

    if (accordion)
    {
        accordion.open = localStorage.getItem('tsd-accordion-settings') === 'true';
    }
};

