import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getCourses } from '../utils/courseStorage';
import { getNewsFromFirestore, subscribeToNews, NewsItem } from '../services/courseService';

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

const formatDateLabel = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const NewsPage: React.FC = () => {
  const courses = getCourses();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    let active = true;
    getNewsFromFirestore()
      .then((items) => {
        if (active) {
          setNews(items.filter((item) => item.active));
        }
      })
      .catch((error) => {
        console.error('Error loading news:', error);
      })
      .finally(() => {
        if (active) setLoadingNews(false);
      });

    const unsubscribe = subscribeToNews((items) => {
      setNews(items.filter((item) => item.active));
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
        Learning & Insights
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Stay up to date with featured stories, upcoming cohorts, and the community-backed news we publish from the admin panel.
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
            <Card
              sx={{
                background: 'rgba(17, 34, 64, 0.65)',
                border: '1px solid rgba(100, 255, 218, 0.1)',
              }}
            >
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  Top Stories
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Fresh commentary and course updates curated by the Top Heights admin team.
                </Typography>
                <Button component={Link} to="/courses" variant="text" color="primary">
                  Explore related courses
                </Button>
              </CardContent>
            </Card>
            <Card
              sx={{
                background: 'rgba(17, 34, 64, 0.55)',
                border: '1px solid rgba(100, 255, 218, 0.08)',
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Related Articles
                </Typography>
                <Stack spacing={1}>
                  {relatedArticles.map((article) => (
                    <Card
                      key={article.title}
                      sx={{ background: 'rgba(17, 34, 64, 0.4)', border: '1px solid rgba(100, 255, 218, 0.08)' }}
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
              </CardContent>
            </Card>
          </Stack>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card
            sx={{
              background: 'rgba(17, 34, 64, 0.65)',
              border: '1px solid rgba(100, 255, 218, 0.1)',
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Latest News
              </Typography>
              {loadingNews ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress color="primary" />
                </Box>
              ) : news.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No active news items yet. Create one through the Admin panel to populate this feed.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {news.map((item) => (
                    <Box
                      key={item.id || item.title}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(100, 255, 218, 0.08)',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {item.title}
                        </Typography>
                        <Chip label={formatDateLabel(item.date)} size="small" />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {item.content || 'No description provided.'}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>

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
