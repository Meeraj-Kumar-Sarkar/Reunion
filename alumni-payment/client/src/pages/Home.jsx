import Hero from '../components/Hero';
import PaymentForm from '../components/PaymentForm';

const Home = () => {
  return (
    <div className="pb-16">
      <Hero />
      <div className="max-w-2xl mx-auto px-4">
        <PaymentForm />
      </div>
    </div>
  );
};

export default Home;
