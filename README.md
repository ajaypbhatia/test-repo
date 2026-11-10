# test-repo
This is a test repo.

## Gold Price Calculator

Open `index.html` in a browser. It's a single file with no build step.

- Rates (AED per gram for 24K, 22K, 21K, 18K, 14K) come from `rates.json`, which the **Deploy site with gold rates** GitHub Action refreshes every 30 minutes. Gulf News is used first and dubaicityofgold.com as backup. Gulf News has no 14K column, so 14K is estimated from the 24K rate by purity.
- If `rates.json` is missing or more than 3 hours old, the page fetches live in the browser (Gulf News first) through public relay services. Click **Fetch live** to refresh.
- Every rate is editable. If the live fetch fails, type the rate in by hand.
- Inputs: total weight (g), carat, making charges (AED/gram, % of gold value, or flat AED), and VAT % (default 5%).
- Output: gold value, making charges, amount before tax, VAT, and the total to pay, each with its % share of the total.
- Investment view: the premium paid above the gold value (making + VAT) and how much gold must rise to break even.
- Your last rates and inputs are remembered in the browser.

### Publishing

GitHub Pages must be set to **Settings → Pages → Source: GitHub Actions**. The workflow in `.github/workflows/pages.yml` deploys on every push to `master`, every 30 minutes, and on demand from the Actions tab.
