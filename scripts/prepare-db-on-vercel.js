const { execSync } = require('node:child_process');

function run(cmd) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

(async () => {
  try {
    if (process.env.VERCEL !== '1') {
      console.log('Not running on Vercel. Skipping DB prepare.');
      process.exit(0);
    }

    if (!process.env.DATABASE_URL || !/^postgres(ql)?:\/\//.test(process.env.DATABASE_URL)) {
      console.log('DATABASE_URL missing or not postgres. Skipping DB prepare.');
      process.exit(0);
    }

    console.log('Preparing database on Vercel...');
    run('npx prisma db push');
    run('node scripts/setup-vercel-db.js');
    console.log('Database prepared.');
  } catch (err) {
    console.error('DB prepare failed:', err.message || err);
    // Do not fail the build hard – keep app deployable even if seed fails
    process.exit(0);
  }
})();
