# create-logger
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=MilesArtemius_create-logger&metric=alert_status)](https://sonarcloud.io/dashboard?id=MilesArtemius_create-logger)  
  
Create a logging module for your app without heavy libraries and googling fot ASCII escape sequences!

## How to use?
Basically website consists four tabs and a terminal window (under them).  
Each terminal window line represents a log output message of your app.  
Each tab represents a mode of terminal and contains specific settings:

### STYLE tab
Style tab is basically a WYSIWYG text editor with limited functionality.
In this mode terminal window is editable but **only one line at a time**.
The active line is marked with white shadow around the line number.
When a line becomes active, all other lines automatically become inactive and unresponsive to any actions.
Following actions and shortcuts are supported:
* _Selection_  
  You can select text contents of the active line (with mouse pointer or keyboard).
  Selected text is marked with pink bars - above and below it.
* _line number click_  
  You can activate a line for editing by clicking on its number. The caret will be placed to the end of it.
* _+ button click_  
  There is an additional fictional empty line in the bottom of terminal window, with '+' instead of number.
  Clicking on that '+' adds (and activates) a new line in the bottom of terminal window.
* _Enter_  
  Adds (and activates) new line directly after currently active.
* _Backspace_  
  Removes a character before cursor if current line is not empty.
  Else, if the line contains formatting, resets it, if not, removes line and activates previous one.  
  NB! Doesn't work if any text on the line selected (this would lead to formatting clash).
* _Arrows (up and down)_
  Activates previous (or next, respectively) line, attempting to place caret to the same position on it.
  If the new active line is too short, places cursor to the end of it.

The style tab contains following settings, that can be applied to selected text on active line:
* `Front (and back) color`  
  Sets font or background color of the selected text respectively.
* `bold - normal - dim`  
  Sets style of selected text.  
  NB! In most terminals dim text style isn't supported.
* `blinking - crossed - underscored - italic`
  Applies following properties to selected text.
* **presets**  
  Presets are predefined editable style sets.
  There are three 3 system presets (error, warning, info) and 3 user presets (beautiful, original, creative).
  Presets as long as general website settings are saved between sessions.  
  To apply preset, click on it outside pen symbol. It will be applied to selected text.  
  To edit preset, click on pen symbol next to it. It will become pink and terminal window will become unresponsive.
  You can edit preset using all controls mentioned above (including presets).
  Effectively selected preset becomes selected text.  
  To return to text styling back and save edited preset simply click the pen button again.
* **variable**  
  Variable controls are used to add variables to code, generated from your console messages.  
  In most cases you need to log out some variables alongside with string literal test.  
  You can instruct code generator to add variables to generated logging methods signature.
  This requires selecting some text (or just setting caret to it), that has common formatting,
  writing variable name and (if needed) picking type.  
  NB! You can not assign variable to differently-formatted message parts (controls will become disabled).

### GENERAL tab
General tab contains basic website settings. While working with them, terminal window remains unresponsive.
These settings are:
* `Front (and back) terminal color`  
  Most of the terminal interfaces are white-on-black (Bash, CMD). However, in your particular case there may be different colors
  (Browser developer tools console (black-on-white), PowerShell (white-on-blue)).  
  The settings are used to set up terminal colors you prefer, front (font) and back (background) colors respectively.
* `Var names in preview`  
  Replaces parts of messages, marked as variables, with variable names surrounded with square brackets in PREVIEW tab.  
  `John` -> `[name]`
* `Human readable code`
  Instructs code generation plugin to make generated code human-readable.  
  That includes generating variables, containing formatting types, and support styling functions.
* `Code args (with 'i' button)`  
  Passes key-value arguments to code generation plugin (just like in CLI apps).  
  Click on `'i'` button shows arguments available for currently selected code generation plugin.
* `Select translation`
  Selects language of the website.
* `Select language`
  Selects code generation plugin.

All settings above (including code arguments for each code generation plugin) are saved between sessions.

### PREVIEW tab
Preview tab contains no settings. In terminal window for each log line its ASCII representation is generated.
For ease of navigation between ASCII escape sequences each code is styles respectively.  
E.g., code, making text blink, blinks, code, making font red, has red font etc.

### CODE tab
Code tab contains no settings. In terminal window for each log line a logging function in selected PL is generated.  
Function, logging nth line by default is called `printNthLine()`.

### Links
Above all, there are three useful links in the upper right corner of the screen.
* **GitHub**  
  Leads to project github page (this page).
* **Wiki**  
  Leads to project [wiki main page](https://github.com/pseusys/create-logger/wiki).
* **Build**  
  Leads to the last commit, that generated current version of website.

## Conclusion
If you experience any issues, please report them.  
You can also contribute, adding a custom translation or a code generation plugin for a new programming language.  
Enjoy your time using create-logger!
