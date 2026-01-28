const core = require('@actions/core');
const fetch = require('node-fetch');

async function run() {
  try {
    // Read inputs
    const apiKey = core.getInput('api_key', { required: true });
    const domainsInput = core.getInput('domains', { required: true });
    const failOnWarning = core.getInput('fail_on_warning') === 'true';
    const failOnCritical = core.getInput('fail_on_critical') === 'true';

    // Parse domains (support both newline and comma separation)
    const domains = domainsInput
      .split(/[\n,]/)
      .map(d => d.trim())
      .filter(d => d.length > 0);

    if (domains.length === 0) {
      core.setFailed('No valid domains provided');
      return;
    }

    console.log(`Checking ${domains.length} domain(s)...`);

    // Call SSL Bulk API
    const response = await fetch('https://ssl.easydmn.com/bulk-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({ domains })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed (${response.status}): ${errorText}`);
    }

    const results = await response.json();

    // Analyze results
    const critical = results.filter(r => r.status === 'CRITICAL');
    const warnings = results.filter(r => r.status === 'WARNING');
    const ok = results.filter(r => r.status === 'OK');

    // Print summary
    console.log('\n=== SSL Certificate Check Results ===');
    console.log(`✓ OK: ${ok.length}`);
    console.log(`⚠ WARNING: ${warnings.length}`);
    console.log(`✗ CRITICAL: ${critical.length}`);

    // Print issues
    if (critical.length > 0) {
      console.log('\nCritical issues:');
      critical.forEach(r => {
        console.log(`  ✗ ${r.domain}: ${r.status}`);
      });
    }

    if (warnings.length > 0) {
      console.log('\nWarnings:');
      warnings.forEach(r => {
        const daysInfo = r.days_left !== null ? `expires in ${r.days_left} days` : 'expiring soon';
        console.log(`  ⚠ ${r.domain}: ${daysInfo}`);
      });
    }

    // Set outputs
    core.setOutput('results', JSON.stringify(results));
    core.setOutput('critical_count', critical.length.toString());
    core.setOutput('warning_count', warnings.length.toString());

    // Fail workflow if needed
    if (failOnCritical && critical.length > 0) {
      core.setFailed(`${critical.length} critical SSL issue(s) found`);
    } else if (failOnWarning && warnings.length > 0) {
      core.setFailed(`${warnings.length} SSL certificate(s) expiring soon`);
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();