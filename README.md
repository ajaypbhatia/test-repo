# test-repo
This is a test repo.

## Gold Price Calculator

Open `index.html` in a browser. It's a single file with no build step.

- Fetches the AED-per-gram gold rates (24K, 22K, 21K, 18K, 14K) from dubaicityofgold.com on load. Click **Fetch live** to refresh them.
- Every rate is editable. If the live fetch fails, type the rate in by hand.
- Inputs: total weight (g), carat, making charges (AED/gram, % of gold value, or flat AED), and VAT % (default 5%).
- Output: gold value, making charges, amount before tax, VAT, and the total to pay.
- Your last rates and inputs are remembered in the browser.
