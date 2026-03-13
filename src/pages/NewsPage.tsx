import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  Box,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getCourses } from '../utils/courseStorage';

const featuredArticles = [
  {
    title: 'From Circuit Boards to Front-End Frameworks',
    summary: 'How Top Heights electricians are teaching engineers to build resilient web apps.',
  },
  {
    title: 'Designing Training Programs with ElectraLogic',
    summary: 'A sneak peek at our upcoming blended learning cohorts.',
  },
];

const relatedArticles = [
  {
    title: 'Zero-to-One: Starting as a Web Developer in Nairobi',
    tag: 'Careers',
  },
  {
    title: 'Security First: Building Secure React Apps',
    tag: 'Cybersecurity',
  },
  {
    title: 'Design Thinking for Technical Teams',
    tag: 'Design',
  },
];

const NewsPage: React.FC = () => {
  const courses = getCourses();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
        Learning & Insights
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Stay up to date with featured stories, upcoming cohorts, and community comments built around our Courses module.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: 3,
        }}
      >
        <Box>
          <Stack spacing={2}>
            {featuredArticles.map((article) => (
              <Card
                key={article.title}
                sx={{ background: 'rgba(17, 34, 64, 0.65)', border: '1px solid rgba(100, 255, 218, 0.1)' }}
              >
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {article.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                    {article.summary}
                  </Typography>
                  <Button component={Link} to="/courses" variant="text" color="primary">
                    Explore related courses
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Stack>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Related Articles
            </Typography>
            <Stack spacing={1}>
              {relatedArticles.map((article) => (
                <Card
                  key={article.title}
                  sx={{ background: 'rgba(17, 34, 64, 0.5)', border: '1px solid rgba(100, 255, 218, 0.08)' }}
                >
                  <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label={article.tag} size="small" />
                      <Typography variant="subtitle1">{article.title}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card
            sx={{
              height: '100%',
              background: 'rgba(17, 34, 64, 0.65)',
              border: '1px solid rgba(100, 255, 218, 0.1)',
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Featured Courses
              </Typography>
              <Stack spacing={1}>
                {courses.slice(0, 3).map((course) => (
                  <Box key={course.id}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1">{course.title}</Typography>
                      <Chip label={course.free ? 'Free' : `KES ${course.price}`} size="small" />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {course.category}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Card
            sx={{
              background: 'rgba(17, 34, 64, 0.55)',
              border: '1px solid rgba(100, 255, 218, 0.08)',
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Comments (Placeholder)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Coming soon: interactive comments and community feedback tied to every featured article.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default NewsPage;
