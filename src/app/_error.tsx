import * as Sentry from '@sentry/nextjs';

export default function Error({ statusCode }: { statusCode: number }) {
  Sentry.captureException(new Error(`Error ${statusCode}`));
  return (
    <div className="bg-navy min-h-screen text-white flex items-center justify-center">
      <h1 className="text-4xl font-bebas">Error {statusCode}</h1>
    </div>
  );
}

Error.getInitialProps = async ({ res, err }: { res: any; err: any }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};
