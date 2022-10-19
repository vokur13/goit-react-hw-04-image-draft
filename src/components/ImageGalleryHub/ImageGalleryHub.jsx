import { useState, useEffect, useReducer, useMemo } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import * as API from 'services/api';
import { Box } from 'components/Box';
import { Button } from 'components/Button';
import { ImageGalleryError } from 'components/ImageGalleryError';
import { ImageGallery } from 'components/ImageGallery';
import { ImageGalleryPending } from 'components/ImageGalleryPending';

// useEffect(()=>{//http:..},[query,page])
{
  /* <button onClick={() =>setPage(page=>page+1)}>Load More</button> */
}

// Modal:
// App.js

// function methodName(arguments) {
//         const [selectedImage, setSelectedImage] = useState(null)

//         const selectImage = (imageURL) => {
//                 setSelectedImage(imageURL)
//         }

//         return (
//                 <div>

//                         <ul>
//                                 {[1,2,3,4].map((x)=>{<li onClick={()=>selectImage(x)}>img</li>})}
//                         </ul>
//                         {selectedImage&&<Modal>Modal<Modal/>}
//                 </div>
//         )
// }

const Status = {
  IDLE: 'idle',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};

export function ImageGalleryHub({ page, query, gallery, total, totalHits }) {
  const step = 1;
  const initialValue = {
    page,
    gallery,
    query,
    total,
    totalHits,
    error: false,
    status: Status.IDLE,
  };

  function setReducer(state, action) {
    switch (action.type) {
      case 'increment':
        return { ...state, page: state.page + action.payload };
      default:
        throw new Error(`Unsupported action action type ${action.type}`);
    }
  }

  const [state, dispatch] = useReducer(setReducer, initialValue);

  function handleMoreImage() {
    dispatch({ type: 'increment', payload: step });
  }

  const [_gallery, setGallery] = useState(gallery);
  const [_query, setQuery] = useState(query);
  const [_total, setTotal] = useState(total);
  const [_totalHits, setTotalHits] = useState(totalHits);
  const [error, setError] = useState(false);
  const [status, setStatus] = useState(Status.IDLE);

  useMemo(() => {
    if (!query) {
      return;
    }
    const fetchAssets = async () => {
      setQuery(query);
      setStatus(Status.PENDING);
      try {
        const { totalHits, hits } = await API.getGallery(_query, state.page);
        if (hits.length === 0) {
          return toast.error(
            `Sorry, there are no images matching your search query for ${_query}. Please try again.`
          );
        }
        setGallery(prevState => [...prevState, ...hits]);
        setTotal(hits.length);
        setTotalHits(totalHits);
        setStatus(Status.RESOLVED);
        return toast.success(`Hooray! We found ${_totalHits} images.`);
      } catch (error) {
        console.log(error);
        setError(true);
        setStatus(Status.REJECTED);
      }
    };
    fetchAssets();
  }, [_query, _totalHits, query, state.page]);

  useEffect(() => {});

  if (status === Status.IDLE) {
    return <div>Please let us know your query item</div>;
  }
  if (status === Status.PENDING) {
    return <ImageGalleryPending query={_query} data={_gallery} />;
  }
  if (status === Status.REJECTED) {
    return <ImageGalleryError message={error.message} />;
  }
  if (status === Status.RESOLVED) {
    return (
      <>
        <ImageGallery data={_gallery} />;
        {_total < _totalHits ? (
          <Box display="flex" justifyContent="center">
            <Button type="button" onClick={handleMoreImage}>
              Load more
            </Button>
          </Box>
        ) : null}
        {_total === _totalHits
          ? toast.warn(
              "We're sorry, but you've reached the end of search results."
            )
          : null}
      </>
    );
  }
}

// export class protoImageGalleryHub extends Component {
//   static defaultProps = {
//     step: 1,
//   };

//   state = {
//     page: this.props.page,
//     gallery: this.props.gallery,
//     query: this.props.query,
//     total: this.props.total,
//     totalHits: this.props.totalHits,
//     error: false,
//     status: Status.IDLE,
//   };

//   async componentDidUpdate(prevProps, prevState) {
//     const { query } = this.props;
//     const { page } = this.state;

//     if (prevProps.query !== query) {
//       try {
//         this.setState({
//           status: Status.PENDING,
//         });
//         const { totalHits, hits } = await API.getGallery(query, page);
//         if (hits.length === 0) {
//           this.setState({ status: Status.REJECTED });
//           return toast.error(
//             `Sorry, there are no images matching your search query for '${query}'. Please try again.`
//           );
//         }
//         this.setState({
//           status: Status.RESOLVED,
//           gallery: [...hits],
//           total: hits.length,
//           totalHits: totalHits,
//         });
//         return toast.success(`Hooray! We found ${totalHits} images.`);
//       } catch (error) {
//         this.setState({ error: true, status: Status.REJECTED });
//         console.log(error);
//       }
//     }
//     if (prevState.page !== this.state.page) {
//       try {
//         this.setState({
//           status: Status.PENDING,
//         });
//         const { hits } = await API.getGallery(query, page);
//         this.setState(prevState => ({
//           status: Status.RESOLVED,
//           gallery: [...prevState.gallery, ...hits],
//           total: prevState.total + hits.length,
//         }));
//       } catch (error) {
//         this.setState({ error: true, status: Status.REJECTED });
//         console.log(error);
//       }
//     }
//   }

//   handleMoreImage = () => {
//     const { step } = this.props;
//     this.setState(prevState => ({
//       page: prevState.page + step,
//     }));
//   };

//   render() {
//     const { query } = this.props;
//     const { gallery, error, status, total, totalHits } = this.state;

//     if (status === 'idle') {
//       return <div>Please let us know your query item</div>;
//     }
//     if (status === 'pending') {
//       return <ImageGalleryPending query={query} data={gallery} />;
//     }
//     if (status === 'rejected') {
//       return <ImageGalleryError message={error.message} />;
//     }
//     if (status === 'resolved') {
//       return (
//         <>
//           <ImageGallery data={gallery} />;
//           {total < totalHits ? (
//             <Box display="flex" justifyContent="center">
//               <Button type="button" onClick={this.handleMoreImage}>
//                 Load more
//               </Button>
//             </Box>
//           ) : null}
//           {total === totalHits
//             ? toast.warn(
//                 "We're sorry, but you've reached the end of search results."
//               )
//             : null}
//         </>
//       );
//     }
//   }
// }

ImageGalleryHub.propTypes = {
  //   page: PropTypes.number.isRequired,
  //   query: PropTypes.string,
  //   gallery: PropTypes.array,
  //   total: PropTypes.number,
  //   totalHits: PropTypes.number,
};

// {
//   /* <p>Whoops, something went wrong, no item upon query {query} found</p> */
// }

// // error.response.data
