import { renderHook } from '@testing-library/react';
import { useGetDataProviderFavorites } from '../../src/hooks/useGetDataProviderFavorites';
import { sleep } from '../../src/stories/Tests/utils';

test.skip('useGetDataProviderFavorites returns current favorites', async () => {
  const { result } = renderHook(() => useGetDataProviderFavorites());

  await sleep(2000);

  console.log(result.current);

  expect(result.current).toEqual(9002);
});
