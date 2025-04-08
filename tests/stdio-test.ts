import { spawn, execSync } from 'child_process';

// Test input for MCP client (JSON format that MCP expects)
const testInput = JSON.stringify({
  type: 'function_call',
  name: 'get_logs',
  arguments: {}
});

// Function to run the MCP client with input and capture output
function runMcpClientWithInput(input: string): Promise<string> {
  console.log('Running MCP client with input:', input);

  // First build the TypeScript code
  console.log('Building TypeScript code...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (error) {
    throw new Error(`Build failed: ${error}`);
  }

  return new Promise((resolve, reject) => {
    // Run the compiled JavaScript with Node.js
    console.log('Running compiled JavaScript...');
    const process = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log('Received stdout:', data.toString());
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error('Received stderr:', data.toString());
    });

    process.on('close', (code) => {
      console.log(`Process exited with code ${code}`);
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });

    // Write input to stdin
    process.stdin.write(input);
    process.stdin.end();
  });
}

// Main test function
async function runStdioTest() {
  try {
    console.log('Starting STDIO test...');

    // Run the MCP client with test input
    const output = await runMcpClientWithInput(testInput);

    console.log('MCP client output:', output);

    // Parse the output as JSON
    const outputJson = JSON.parse(output);

    // Verify the output structure
    if (outputJson.type !== 'function_result') {
      throw new Error(`Expected output type to be 'function_result', got '${outputJson.type}'`);
    }

    console.log('Test passed! 🎉');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the test
runStdioTest();
