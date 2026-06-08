import { Router } from 'express';

const router = Router();

const faqs = [
  {
    question: 'What are your opening hours?',
    answer:
      'Lumen Hollow is open every day of the year, from 9.00 am to 6.00 pm. Selected seasonal events extend our hours into the evening, please check the Events page for current dates.',
  },
  {
    question: 'Is the park suitable for young children?',
    answer:
      'Yes. All five habitats are buggy-accessible and our trails are paved or boardwalked throughout. The Glowing Shore and Echo Caves are darker by design, so we recommend bringing a familiar comfort item for very young children.',
  },
  {
    question: 'Can I bring my dog?',
    answer:
      'Assistance dogs are warmly welcomed across the whole park. We are not able to admit pet dogs, as the close-range presence of wildlife would be stressful for our resident animals.',
  },
  {
    question: 'Why is the park darker than other wildlife parks?',
    answer:
      'Many of our species are nocturnal or crepuscular, they are most active around dusk and through the night. Our deliberately low lighting is designed for their welfare and helps visitors see the animals at their most natural.',
  },
  {
    question: 'Do I need to bring a torch?',
    answer:
      'Please do not bring torches into the habitats. Strong light disturbs nocturnal animals and disrupts the visitor experience for others. Our pathways are lit at a level that is safe and comfortable once your eyes adjust.',
  },
  {
    question: 'Is the park accessible for wheelchair users?',
    answer:
      'Yes. All habitats and the main trail loop are step-free. Accessible toilets are located at the main entrance and at the Whisperwood gatehouse. Please contact us in advance if you would like to arrange a quieter visit.',
  },
  {
    question: 'Can I photograph the animals?',
    answer:
      'Yes, with a key restriction: flash photography is not permitted anywhere in the park. Modern phone and camera sensors handle our lighting levels well without flash.',
  },
  {
    question: 'Do you offer school visits?',
    answer:
      'We run a structured school programme for Key Stages 1 to 3, with workshops aligned to the national curriculum. Please use the Contact page to enquire about availability.',
  },
];

router.get('/', (req, res) => {
  res.render('faq', { title: 'Frequently Asked Questions, Lumen Hollow', faqs });
});

export default router;
