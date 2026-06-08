<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


# restart the server

bash scripts/restart.sh

# git push rules

must use `git -c user.email="ivalue2333@gmail.com" commit -m "something"` so that the user is right.


# build

vercel build

vercel deploy --prebuilt

vercel deploy --prebuilt --prod

vercel build --prod && vercel deploy --prebuilt --prod